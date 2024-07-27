import * as fs from 'fs/promises';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';
import { RepopackConfigMerged } from '../types/index.js';
import { getFileManipulator } from './fileManipulator.js';
import { logger } from './logger.js';

export async function processFile(
  filePath: string,
  config: RepopackConfigMerged,
  fsModule = fs,
): Promise<string | null> {
  if (isBinary(filePath)) {
    logger.debug(`Skipping binary by path. path: ${filePath}`);
    return null;
  }

  logger.trace(`Processing file: ${filePath}`);

  const buffer = await fsModule.readFile(filePath);

  if (isBinary(null, buffer)) {
    logger.debug(`Skipping binary by content. path: ${filePath}`);
    return null;
  }

  const encoding = jschardet.detect(buffer).encoding || 'utf-8';
  let content = iconv.decode(buffer, encoding);

  content = preprocessContent(content, config);

  if (config.output.removeComments) {
    const manipulator = getFileManipulator(filePath);
    if (manipulator) {
      content = manipulator.removeComments(content);
    }
  }

  return content;
}

export function preprocessContent(content: string, config: RepopackConfigMerged): string {
  content = content.trim();

  if (config.output.removeEmptyLines) {
    content = removeEmptyLines(content);
  }

  return content;
}

function removeEmptyLines(content: string): string {
  return content
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n');
}
