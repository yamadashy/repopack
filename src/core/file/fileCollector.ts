import * as fs from 'node:fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import pMap from 'p-map';
import { logger } from '../../shared/logger.js';
import { getProcessConcurrency } from '../../shared/processConcurrency.js';
import type { RawFile } from './fileTypes.js';

export const collectFiles = async (filePaths: string[], rootDir: string): Promise<RawFile[]> => {
  const rawFiles = await pMap(
    filePaths,
    async (filePath) => {
      const fullPath = path.resolve(rootDir, filePath);
      const content = await readRawFile(fullPath);
      if (content) {
        return { path: filePath, content };
      }
      return null;
    },
    {
      concurrency: getProcessConcurrency(),
    },
  );

  return rawFiles.filter((file): file is RawFile => file != null);
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
