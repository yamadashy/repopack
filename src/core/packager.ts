import * as fs from 'node:fs/promises';
import path from 'node:path';
import type { SecretLintCoreResult } from '@secretlint/types';
import { RepopackConfigMerged } from '../types/index.js';
import { sanitizeFiles as defaultSanitizeFiles } from '../utils/fileHandler.js';
import {
  getAllIgnorePatterns as defaultGetAllIgnorePatterns,
  createIgnoreFilter as defaultCreateIgnoreFilter,
  IgnoreFilter,
} from '../utils/ignoreUtils.js';
import { generateOutput as defaultGenerateOutput } from './outputGenerator.js';
import { checkFileWithSecretLint, createSecretLintConfig } from '../utils/secretLintUtils.js';
import { logger } from '../utils/logger.js';

export interface Dependencies {
  getAllIgnorePatterns: typeof defaultGetAllIgnorePatterns;
  createIgnoreFilter: typeof defaultCreateIgnoreFilter;
  generateOutput: typeof defaultGenerateOutput;
  sanitizeFiles: typeof defaultSanitizeFiles;
}

export interface PackResult {
  totalFiles: number;
  totalCharacters: number;
  fileCharCounts: Record<string, number>;
  suspiciousFilesResults: SecretLintCoreResult[];
}

export async function pack(
  rootDir: string,
  config: RepopackConfigMerged,
  deps: Dependencies = {
    getAllIgnorePatterns: defaultGetAllIgnorePatterns,
    createIgnoreFilter: defaultCreateIgnoreFilter,
    generateOutput: defaultGenerateOutput,
    sanitizeFiles: defaultSanitizeFiles,
  },
): Promise<PackResult> {
  // Get ignore patterns
  const ignorePatterns = await deps.getAllIgnorePatterns(rootDir, config);
  const ignoreFilter = deps.createIgnoreFilter(ignorePatterns);

  // Get all file paths in the directory
  const filePaths = await getFilePaths(rootDir, '', ignoreFilter);

  // Perform security check
  const suspiciousFilesResults = await performSecurityCheck(filePaths, rootDir);

  // Sanitize files and generate output
  const sanitizedFiles = await deps.sanitizeFiles(filePaths, rootDir, config);
  await deps.generateOutput(rootDir, config, sanitizedFiles, filePaths);

  // Metrics
  const totalFiles = sanitizedFiles.length;
  const totalCharacters = sanitizedFiles.reduce((sum, file) => sum + file.content.length, 0);
  const fileCharCounts: Record<string, number> = {};
  sanitizedFiles.forEach((file) => {
    fileCharCounts[file.path] = file.content.length;
  });

  return {
    totalFiles,
    totalCharacters,
    fileCharCounts,
    suspiciousFilesResults,
  };
}

async function getFilePaths(dir: string, relativePath: string, ignoreFilter: IgnoreFilter): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    const entryRelativePath = path.join(relativePath, entry.name);

    if (!ignoreFilter(entryRelativePath)) {
      logger.trace(`Ignoring file: ${entryRelativePath}`);
      continue;
    }

    if (entry.isDirectory()) {
      const subDirPaths = await getFilePaths(path.join(dir, entry.name), entryRelativePath, ignoreFilter);
      filePaths.push(...subDirPaths);
    } else {
      logger.trace(`Adding file: ${entryRelativePath}`);
      filePaths.push(entryRelativePath);
    }
  }

  return filePaths;
}

async function performSecurityCheck(filePaths: string[], rootDir: string): Promise<SecretLintCoreResult[]> {
  const secretLintConfig = createSecretLintConfig();
  const suspiciousFilesResults: SecretLintCoreResult[] = [];

  for (const filePath of filePaths) {
    const fullPath = path.join(rootDir, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const secretLintResult = await checkFileWithSecretLint(fullPath, content, secretLintConfig);
    const isSuspicious = secretLintResult.messages.length > 0;
    if (isSuspicious) {
      suspiciousFilesResults.push(secretLintResult);
    }
  }

  return suspiciousFilesResults;
}
