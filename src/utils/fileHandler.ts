import * as fs from 'fs/promises';
import isBinaryPath from 'is-binary-path';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';

export async function processFile(filePath: string, fsModule = fs): Promise<string | null> {
  // Skip binary files
  if (isBinaryPath(filePath)) {
    return null;
  }

  try {
    const buffer = await fsModule.readFile(filePath);
    const encoding = jschardet.detect(buffer).encoding || 'utf-8';
    const content = iconv.decode(buffer, encoding);

    if (!isValidTextContent(content)) {
      return null;
    }

    return preprocessContent(content);
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
