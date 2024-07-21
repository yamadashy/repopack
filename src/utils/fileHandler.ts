import * as fs from 'fs/promises';
import isBinaryPath from 'is-binary-path';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';
import { RepopackConfigMerged } from '../types/index.js';
import { getFileManipulator } from './fileManipulator.js';

export async function processFile(
  filePath: string,
  config: RepopackConfigMerged,
  fsModule = fs,
): Promise<string | null> {
  // Skip binary files
  if (isBinaryPath(filePath)) {
    return null;
  }

  try {
    const buffer = await fsModule.readFile(filePath);
    const encoding = jschardet.detect(buffer).encoding || 'utf-8';
    let content = iconv.decode(buffer, encoding);

    if (!isValidTextContent(content)) {
      return null;
    }

    content = preprocessContent(content);

    if (config.output.removeComments) {
      const manipulator = getFileManipulator(filePath);
      if (manipulator) {
        content = manipulator.removeComments(content);
      }
    }

    return content;
  } catch (error) {
    console.warn(`Error processing file ${filePath}:`, error);
    return null;
  }
}

function isValidTextContent(content: string): boolean {
  // Check the validity of the text
  // If the percentage of non-printable characters is greater than a certain value, it is judged not to
  const nonPrintableChars = content.replace(/[\x20-\x7E\n\r\t]/g, '');

  // If the percentage of non-printable characters is greater than 10%, it is judged not to be text
  return nonPrintableChars.length / content.length < 0.1;
}

export function preprocessContent(content: string): string {
  return content.trim();
}
