import { globby } from 'globby';
import { logger } from '../../shared/logger.js';
import type { RepopackConfigMerged } from '../../config/configTypes.js';
import { defaultIgnoreList } from '../../config/defaultIgnore.js';
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
    ignorePatterns = [...ignorePatterns, ...defaultIgnoreList];
  }

  // Add repopack output file
  if (config.output.filePath) {
    let relativeOutputPath = config.output.filePath.replace(rootDir, '');
    if (relativeOutputPath.startsWith('/')) {
      relativeOutputPath = relativeOutputPath.slice(1);
    }
    ignorePatterns.push(relativeOutputPath);
  }

  // Add custom ignore patterns
  if (config.ignore.customPatterns) {
    ignorePatterns = [...ignorePatterns, ...config.ignore.customPatterns];
  }

  return ignorePatterns;
};
