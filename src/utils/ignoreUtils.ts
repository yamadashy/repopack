import * as fs from 'fs/promises';
import path from 'path';
import ignore from 'ignore';
import { logger } from './logger.js';
import { RepopackConfigMerged } from '../types/index.js';
import { defaultIgnoreList } from './defaultIgnore.js';

export async function getIgnorePatterns(filename: string, rootDir: string, fsModule = fs): Promise<string[]> {
  const ignorePath = path.join(rootDir, filename);
  try {
    const ignoreContent = await fsModule.readFile(ignorePath, 'utf-8');
    return parseIgnoreContent(ignoreContent);
  } catch (error) {
    logger.debug(`No ${filename} file found or unable to read it.`);
    return [];
  }
}

export function parseIgnoreContent(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

export type IgnoreFilter = (path: string) => boolean;

export function createIgnoreFilter(patterns: string[]): IgnoreFilter {
  const ig = ignore.default().add(patterns);
  return ig.createFilter();
}

export async function getAllIgnorePatterns(rootDir: string, config: RepopackConfigMerged): Promise<string[]> {
  let ignorePatterns: string[] = [];

  if (config.ignore.useDefaultPatterns) {
    ignorePatterns = [...ignorePatterns, ...defaultIgnoreList];
  }

  const gitignorePatterns = await getIgnorePatterns('.gitignore', rootDir);
  if (config.ignore.useGitignore) {
    ignorePatterns = [...ignorePatterns, ...gitignorePatterns];
  }

  const repopackIgnorePatterns = await getIgnorePatterns('.repopackignore', rootDir);
  ignorePatterns = [...ignorePatterns, ...repopackIgnorePatterns];

  if (config.ignore.customPatterns) {
    ignorePatterns = [...ignorePatterns, ...config.ignore.customPatterns];
  }

  return ignorePatterns;
}
