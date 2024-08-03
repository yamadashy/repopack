import path from 'path';
import { globby } from 'globby';
import { logger } from './logger.js';
import type { RepopackConfigMerged } from '../config/configTypes.js';
import * as fs from 'node:fs/promises';
import { defaultIgnoreList } from './defaultIgnore.js';

export async function filterFiles(rootDir: string, config: RepopackConfigMerged): Promise<string[]> {
  const includePatterns = config.include.length > 0 ? config.include : ['**/*'];

  const ignorePatterns = await getAllIgnorePatterns(rootDir, config);

  logger.trace('Include patterns:', includePatterns);
  logger.trace('Ignore patterns:', ignorePatterns);

  try {
    const filePaths = await globby(includePatterns, {
      cwd: rootDir,
      ignore: ignorePatterns,
      // Ignore option is in accordance with .gitignore rules
      gitignore: true,
      dot: true,
      onlyFiles: true,
      followSymbolicLinks: false,
      absolute: false,
    });

    logger.trace(`Filtered ${filePaths.length} files`);
    return filePaths;
  } catch (error) {
    logger.error('Error filtering files:', error);
    throw new Error('Failed to filter files');
  }
}

export function parseIgnoreContent(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

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

export async function getAllIgnorePatterns(rootDir: string, config: RepopackConfigMerged): Promise<string[]> {
  let ignorePatterns: string[] = [];

  // Add default ignore patterns
  if (config.ignore.useDefaultPatterns) {
    ignorePatterns = [...ignorePatterns, ...defaultIgnoreList];
  }

  // Add .gitignore patterns
  const gitignorePatterns = await getIgnorePatterns('.gitignore', rootDir);
  if (config.ignore.useGitignore) {
    ignorePatterns = [...ignorePatterns, ...gitignorePatterns];
  }

  // Add .repopackignore patterns
  const repopackIgnorePatterns = await getIgnorePatterns('.repopackignore', rootDir);
  ignorePatterns = [...ignorePatterns, ...repopackIgnorePatterns];

  // Add custom ignore patterns
  if (config.ignore.customPatterns) {
    ignorePatterns = [...ignorePatterns, ...config.ignore.customPatterns];
  }

  return ignorePatterns;
}
