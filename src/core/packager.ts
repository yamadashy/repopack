import * as fs from 'fs/promises';
import path from 'path';
import { RepopackConfig } from '../types/index.js';
import { processFile as defaultProcessFile } from '../utils/fileHandler.js';
import {
  getGitignorePatterns as defaultGetGitignorePatterns,
  createIgnoreFilter as defaultCreateIgnoreFilter,
} from '../utils/gitignoreUtils.js';
import { generateOutput as defaultGenerateOutput } from './outputGenerator.js';
import { defaultIgnoreList } from '../utils/defaultIgnore.js';

export interface Dependencies {
  getGitignorePatterns: typeof defaultGetGitignorePatterns;
  createIgnoreFilter: typeof defaultCreateIgnoreFilter;
  processFile: typeof defaultProcessFile;
  generateOutput: typeof defaultGenerateOutput;
}

export interface PackResult {
  totalFiles: number;
  totalCharacters: number;
}

export async function pack(
  rootDir: string,
  config: RepopackConfig,
  deps: Dependencies = {
    getGitignorePatterns: defaultGetGitignorePatterns,
    createIgnoreFilter: defaultCreateIgnoreFilter,
    processFile: defaultProcessFile,
    generateOutput: defaultGenerateOutput,
  },
): Promise<PackResult> {
  const gitignorePatterns = await deps.getGitignorePatterns(rootDir);

  const ignorePatterns = getIgnorePatterns(gitignorePatterns, config);
  const ignoreFilter = deps.createIgnoreFilter(ignorePatterns);

  const packedFiles = await packDirectory(rootDir, '', config, ignoreFilter, deps);

  const totalFiles = packedFiles.length;
  const totalCharacters = packedFiles.reduce((sum, file) => sum + file.content.length, 0);

  await deps.generateOutput(rootDir, config, packedFiles);

  return {
    totalFiles,
    totalCharacters,
  };
}

function getIgnorePatterns(gitignorePatterns: string[], config: RepopackConfig): string[] {
  let ignorePatterns = [...gitignorePatterns];
  if (config.ignore.useDefaultPatterns) {
    ignorePatterns = [...ignorePatterns, ...defaultIgnoreList];
  }
  if (config.ignore.customPatterns) {
    ignorePatterns = [...ignorePatterns, ...config.ignore.customPatterns];
  }
  return ignorePatterns;
}

async function packDirectory(
  dir: string,
  relativePath: string,
  config: RepopackConfig,
  ignoreFilter: (path: string) => boolean,
  deps: Dependencies,
): Promise<{ path: string; content: string }[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const packedFiles: { path: string; content: string }[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    if (!ignoreFilter(entryRelativePath)) continue;

    if (entry.isDirectory()) {
      const subDirFiles = await packDirectory(fullPath, entryRelativePath, config, ignoreFilter, deps);
      packedFiles.push(...subDirFiles);
    } else {
      const content = await deps.processFile(fullPath);
      if (content) {
        packedFiles.push({ path: entryRelativePath, content });
      }
    }
  }

  return packedFiles;
}
