import * as fs from 'fs/promises';
import path from 'path';
import { RepopackConfigMerged } from '../types/index.js';
import { processFile as defaultProcessFile } from '../utils/fileHandler.js';
import {
  getGitignorePatterns as defaultGetGitignorePatterns,
  createIgnoreFilter as defaultCreateIgnoreFilter,
  IgnoreFilter,
} from '../utils/gitignoreUtils.js';
import { generateOutput as defaultGenerateOutput } from './outputGenerator.js';
import { defaultIgnoreList } from '../utils/defaultIgnore.js';
import { checkFileWithSecretLint, createSecretLintConfig } from '../utils/secretLintUtils.js';

export interface Dependencies {
  getGitignorePatterns: typeof defaultGetGitignorePatterns;
  createIgnoreFilter: typeof defaultCreateIgnoreFilter;
  processFile: typeof defaultProcessFile;
  generateOutput: typeof defaultGenerateOutput;
}

export interface PackResult {
  totalFiles: number;
  totalCharacters: number;
  fileCharCounts: Record<string, number>;
  suspiciousFiles: string[];
}

export async function pack(
  rootDir: string,
  config: RepopackConfigMerged,
  deps: Dependencies = {
    getGitignorePatterns: defaultGetGitignorePatterns,
    createIgnoreFilter: defaultCreateIgnoreFilter,
    processFile: defaultProcessFile,
    generateOutput: defaultGenerateOutput,
  },
): Promise<PackResult> {
  // Get ignore patterns
  const gitignorePatterns = await deps.getGitignorePatterns(rootDir);
  const ignorePatterns = getIgnorePatterns(gitignorePatterns, config);
  const ignoreFilter = deps.createIgnoreFilter(ignorePatterns);

  // Get all file paths in the directory
  const filePaths = await getFilePaths(rootDir, '', ignoreFilter);

  // Perform security check
  const suspiciousFiles = await performSecurityCheck(filePaths, rootDir);

  // Pack files and generate output
  const packedFiles = await packFiles(filePaths, rootDir, config, deps);
  await deps.generateOutput(rootDir, config, packedFiles);

  // Metrics
  const totalFiles = packedFiles.length;
  const totalCharacters = packedFiles.reduce((sum, file) => sum + file.content.length, 0);
  const fileCharCounts: Record<string, number> = {};
  packedFiles.forEach((file) => {
    fileCharCounts[file.path] = file.content.length;
  });

  return {
    totalFiles,
    totalCharacters,
    fileCharCounts,
    suspiciousFiles,
  };
}

function getIgnorePatterns(gitignorePatterns: string[], config: RepopackConfigMerged): string[] {
  let ignorePatterns = [...gitignorePatterns];
  if (config.ignore.useDefaultPatterns) {
    ignorePatterns = [...ignorePatterns, ...defaultIgnoreList];
  }
  if (config.ignore.customPatterns) {
    ignorePatterns = [...ignorePatterns, ...config.ignore.customPatterns];
  }
  return ignorePatterns;
}

async function getFilePaths(dir: string, relativePath: string, ignoreFilter: IgnoreFilter): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    const entryRelativePath = path.join(relativePath, entry.name);

    if (!ignoreFilter(entryRelativePath)) continue;

    if (entry.isDirectory()) {
      const subDirPaths = await getFilePaths(path.join(dir, entry.name), entryRelativePath, ignoreFilter);
      filePaths.push(...subDirPaths);
    } else {
      filePaths.push(entryRelativePath);
    }
  }

  return filePaths;
}

async function performSecurityCheck(filePaths: string[], rootDir: string): Promise<string[]> {
  const secretLintConfig = createSecretLintConfig();
  const suspiciousFiles: string[] = [];

  for (const filePath of filePaths) {
    const fullPath = path.join(rootDir, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const isSuspicious = await checkFileWithSecretLint(fullPath, content, secretLintConfig);
    if (isSuspicious) {
      suspiciousFiles.push(filePath);
    }
  }

  return suspiciousFiles;
}

async function packFiles(
  filePaths: string[],
  rootDir: string,
  config: RepopackConfigMerged,
  deps: Dependencies,
): Promise<{ path: string; content: string }[]> {
  const packedFiles: { path: string; content: string }[] = [];

  for (const filePath of filePaths) {
    const fullPath = path.join(rootDir, filePath);
    const content = await deps.processFile(fullPath, config);
    if (content) {
      packedFiles.push({ path: filePath, content });
    }
  }

  return packedFiles;
}
