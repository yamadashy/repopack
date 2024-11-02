import { globby } from 'globby';
import type { RepomixConfigMerged } from '../../config/configTypes.js';
import { defaultIgnoreList } from '../../config/defaultIgnore.js';
import { logger } from '../../shared/logger.js';
import { sortPaths } from './filePathSort.js';

export const searchFiles = async (rootDir: string, config: RepomixConfigMerged): Promise<string[]> => {
  const includePatterns = config.include.length > 0 ? config.include : ['**/*'];

  try {
    const [ignorePatterns, ignoreFilePatterns] = await Promise.all([
      getIgnorePatterns(rootDir, config),
      getIgnoreFilePatterns(config),
    ]);

    logger.trace('Include patterns:', includePatterns);
    logger.trace('Ignore patterns:', ignorePatterns);
    logger.trace('Ignore file patterns:', ignoreFilePatterns);

    const filePaths = await globby(includePatterns, {
      cwd: rootDir,
      ignore: [...ignorePatterns],
      ignoreFiles: [...ignoreFilePatterns],
      onlyFiles: true,
      absolute: false,
      dot: true,
      followSymbolicLinks: false,
    });

    logger.trace(`Filtered ${filePaths.length} files`);
    const sortedPaths = sortPaths(filePaths);

    return sortedPaths;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Error filtering files:', error.message);
      throw new Error(`Failed to filter files in directory ${rootDir}. Reason: ${error.message}`);
    }
    logger.error('An unexpected error occurred:', error);
    throw new Error('An unexpected error occurred while filtering files.');
  }
};

export const parseIgnoreContent = (content: string): string[] => {
  if (!content) return [];

  return content.split('\n').reduce<string[]>((acc, line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      acc.push(trimmedLine);
    }
    return acc;
  }, []);
};

export const getIgnoreFilePatterns = async (config: RepomixConfigMerged): Promise<string[]> => {
  const ignoreFilePatterns: string[] = [];

  if (config.ignore.useGitignore) {
    ignoreFilePatterns.push('**/.gitignore');
  }

  ignoreFilePatterns.push('**/.repomixignore');

  return ignoreFilePatterns;
};

export const getIgnorePatterns = async (rootDir: string, config: RepomixConfigMerged): Promise<string[]> => {
  const ignorePatterns = new Set<string>();

  // Add default ignore patterns
  if (config.ignore.useDefaultPatterns) {
    logger.trace('Adding default ignore patterns');
    for (const pattern of defaultIgnoreList) {
      ignorePatterns.add(pattern);
    }
  }

  // Add repomix output file
  if (config.output.filePath) {
    logger.trace('Adding output file to ignore patterns:', config.output.filePath);
    ignorePatterns.add(config.output.filePath);
  }

  // Add custom ignore patterns
  if (config.ignore.customPatterns) {
    logger.trace('Adding custom ignore patterns:', config.ignore.customPatterns);
    for (const pattern of config.ignore.customPatterns) {
      ignorePatterns.add(pattern);
    }
  }

  return Array.from(ignorePatterns);
};
