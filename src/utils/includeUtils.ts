import path from 'path';
import { logger } from '../utils/logger.js';
export function filterIncludedFiles(rootDir: string, filePaths: string[], include: string[]): string[] {
    if (include.length === 0) {
      return filePaths;
    }
  
    const includeSet: Set<string> = new Set(include.map((file: string) => path.resolve(rootDir, file)));
    const absoluteFilePaths: string[] = filePaths.map((filePath: string) => path.resolve(rootDir, filePath));
    const filteredPaths: string[] = absoluteFilePaths.filter((filePath: string) => includeSet.has(filePath));
  
    // Log any files in includeSet that are not found in absoluteFilePaths
    includeSet.forEach((includedFile: string) => {
      if (!absoluteFilePaths.includes(includedFile)) {
        logger.trace(`Included file not found: ${includedFile}`);
      }
    });
  
    return filteredPaths.map((filePath: string) => path.relative(rootDir, filePath));
  }