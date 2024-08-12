import * as fs from 'node:fs/promises';
import path from 'node:path';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';
import { RepopackConfigMerged } from '../../config/configTypes.js';
import { logger } from '../../shared/logger.js';
import { getFileManipulator } from './fileManipulater.js';

export interface SanitizedFile {
  path: string;
  content: string;
}

export const sanitizeFiles = async (
  filePaths: string[],
  rootDir: string,
  config: RepopackConfigMerged,
): Promise<SanitizedFile[]> => {
  const sanitizedFiles: SanitizedFile[] = [];

  for (const filePath of filePaths) {
    const fullPath = path.join(rootDir, filePath);
    const content = await sanitizeFile(fullPath, config);
    if (content) {
      sanitizedFiles.push({ path: filePath, content });
    }
  }

  return sanitizedFiles;
};

export const sanitizeFile = async (
  filePath: string,
  config: RepopackConfigMerged,
  fsModule = fs,
): Promise<string | null> => {
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

  let content: string;

  try {
    const encoding = jschardet.detect(buffer).encoding || 'utf-8';
    content = iconv.decode(buffer, encoding);
  } catch (error) {
    logger.warn(`Failed to decode file: ${filePath}`, error);
    return null;
  }

  if (config.output.removeComments) {
    const manipulator = getFileManipulator(filePath);
    if (manipulator) {
      content = manipulator.removeComments(content);
    }
  }

  content = postprocessContent(content, config);

  return content;
};

export const postprocessContent = (content: string, config: RepopackConfigMerged): string => {
  content = content.trim();

  if (config.output.removeEmptyLines) {
    content = removeEmptyLines(content);
  }

  return content;
};

const removeEmptyLines = (content: string): string =>
  content
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n');
