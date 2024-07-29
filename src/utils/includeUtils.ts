import path from 'path';
import { logger } from '../utils/logger.js';

export function filterIncludedFiles(rootDir: string, filePaths: string[], include: string[]): string[] {
  if (include.length === 0) {
    return filePaths;
  }

  // Normalize paths to handle case insensitivity and different representations
  const normalizePath = (p: string) => path.normalize(path.resolve(rootDir, p)).toLowerCase();

  // Create a Set of normalized absolute paths for the included files
  const includeSet = new Set(include.map(normalizePath));

  // Map file paths to their normalized absolute paths and filter those that are in the include set
  const filteredAbsolutePaths = filePaths
    .map(filePath => path.resolve(rootDir, filePath))
    .filter(absolutePath => includeSet.has(normalizePath(absolutePath)));

  // Log any files in includeSet that are not found in filePaths
  const absoluteFilePathsSet = new Set(filePaths.map(filePath => normalizePath(path.resolve(rootDir, filePath))));
  const missingFiles = [...includeSet].filter(includedFile => !absoluteFilePathsSet.has(includedFile));
  if (missingFiles.length > 0) {
    logger.trace(`Included files not found: ${missingFiles.join(', ')}`);
  }

  // Convert filtered absolute paths back to relative paths
  return filteredAbsolutePaths.map(filePath => path.relative(rootDir, filePath));
}