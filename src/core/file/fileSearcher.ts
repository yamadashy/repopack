import { globby } from 'globby';
import type { RepopackConfigMerged } from '../../config/configTypes.js';
import { defaultIgnoreList } from '../../config/defaultIgnore.js';
import { logger } from '../../shared/logger.js';
import { sortPaths } from './filePathSorter.js';

export const searchFiles = async (rootDir: string, config: RepopackConfigMerged): Promise<string[]> => {
  const includePatterns = config.include.length > 0 ? config.include : ['**/*'];

  const ignorePatterns = await getIgnorePatterns(rootDir, config);
  const ignoreFilePatterns = await getIgnoreFilePatterns(config);

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

    logger.trace(`Filtered ${filePaths.length} files`);

    // Sort the filtered paths
    const sortedPaths = sortPaths(filePaths);

    return sortedPaths;
  } catch (error) {
    logger.error('Error filtering files:', error);
    throw new Error('Failed to filter files');
  }
};

export const parseIgnoreContent = (content: string): string[] =>
  content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

export const getIgnoreFilePatterns = async (config: RepopackConfigMerged): Promise<string[]> => {
  const ignoreFilePatterns: string[] = [];

  if (config.ignore.useGitignore) {
    ignoreFilePatterns.push('**/.gitignore');
  }

  ignoreFilePatterns.push('**/.repopackignore');

  return ignoreFilePatterns;
};

export const getIgnorePatterns = async (rootDir: string, config: RepopackConfigMerged): Promise<string[]> => {
  let ignorePatterns: string[] = [];

  // Add default ignore patterns
  if (config.ignore.useDefaultPatterns) {
    logger.trace('Adding default ignore patterns');
    ignorePatterns = [...ignorePatterns, ...defaultIgnoreList];
  }

  // Add repopack output file
  if (config.output.filePath) {
    logger.trace('Adding output file to ignore patterns:', config.output.filePath);
    ignorePatterns.push(config.output.filePath);
  }

  // Add custom ignore patterns
  if (config.ignore.customPatterns) {
    logger.trace('Adding default custom ignore patterns: ', config.ignore.customPatterns);
    ignorePatterns = [...ignorePatterns, ...config.ignore.customPatterns];
  }

  return ignorePatterns;
};
