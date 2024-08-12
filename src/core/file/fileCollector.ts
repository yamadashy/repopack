import * as fs from 'node:fs/promises';
import path from 'node:path';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';
import { logger } from '../../shared/logger.js';
import { RawFile } from './fileTypes.js';

export const collectFiles = async (filePaths: string[], rootDir: string): Promise<RawFile[]> => {
  const rawFiles: RawFile[] = [];

  for (const filePath of filePaths) {
    const fullPath = path.resolve(rootDir, filePath);
    const content = await readRawFile(fullPath);
    if (content) {
      rawFiles.push({ path: filePath, content });
    }
  }

  return rawFiles;
};

const readRawFile = async (filePath: string): Promise<string | null> => {
  if (isBinary(filePath)) {
    logger.debug(`Skipping binary file: ${filePath}`);
    return null;
  }

  logger.trace(`Processing file: ${filePath}`);

  try {
    const buffer = await fs.readFile(filePath);

    if (isBinary(null, buffer)) {
      logger.debug(`Skipping binary file (content check): ${filePath}`);
      return null;
    }

    const encoding = jschardet.detect(buffer).encoding || 'utf-8';
    const content = iconv.decode(buffer, encoding);

    return content;
  } catch (error) {
    logger.warn(`Failed to read file: ${filePath}`, error);
    return null;
  }
};
