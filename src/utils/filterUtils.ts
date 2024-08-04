import { globby } from 'globby';
import { logger } from './logger.js';
import type { RepopackConfigMerged } from '../config/configTypes.js';
import { defaultIgnoreList } from './defaultIgnore.js';

export async function filterFiles(rootDir: string, config: RepopackConfigMerged): Promise<string[]> {
  const includePatterns = config.include.length > 0 ? config.include : ['**/*'];

  const ignorePatterns = await getIgnorePatterns(config);
  const ignoreFilePatterns = await getIgnoreFilePatterns(rootDir, config);

  logger.trace('Include patterns:', includePatterns);
  logger.trace('Ignore patterns:', ignorePatterns);
  logger.trace('Ignore file patterns: ', ignoreFilePatterns);

  try {
    const filePaths = await globby(includePatterns, {
      cwd: rootDir,
      ignore: ignorePatterns,
      ignoreFiles: ignoreFilePatterns,
      // result options
      onlyFiles: true,
      absolute: false,
      // glob options
      dot: true,
      followSymbolicLinks: false,
    });

    // HACK: globby is not filtering sub directories correctly.

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

export async function getIgnoreFilePatterns(rootDir: string, config: RepopackConfigMerged): Promise<string[]> {
  let ignoreFilePatterns: string[] = [];

  if (config.ignore.useGitignore) {
    ignoreFilePatterns.push('**/.gitignore');
  }

  ignoreFilePatterns.push('**/.repopackignore');

  return ignoreFilePatterns;
}

export async function getIgnorePatterns(config: RepopackConfigMerged): Promise<string[]> {
  let ignorePatterns: string[] = [];

  // Add default ignore patterns
  if (config.ignore.useDefaultPatterns) {
    ignorePatterns = [...ignorePatterns, ...defaultIgnoreList];
  }

  // Add custom ignore patterns
  if (config.ignore.customPatterns) {
    ignorePatterns = [...ignorePatterns, ...config.ignore.customPatterns];
  }

  return ignorePatterns;
}
