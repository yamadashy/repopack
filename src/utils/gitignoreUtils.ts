import * as fs from 'fs/promises';
import path from 'path';
import ignore from 'ignore';
import { logger } from './logger.js';

export async function getGitignorePatterns(rootDir: string, fsModule = fs): Promise<string[]> {
  const gitignorePath = path.join(rootDir, '.gitignore');
  try {
    const gitignoreContent = await fsModule.readFile(gitignorePath, 'utf-8');
    return parseGitignoreContent(gitignoreContent);
  } catch (error) {
    logger.warn('No .gitignore file found or unable to read it.');
    return [];
  }
}

export function parseGitignoreContent(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

export type IgnoreFilter = (path: string) => boolean;

export function createIgnoreFilter(patterns: string[]): IgnoreFilter {
  const ig = ignore.default().add(patterns);
  return ig.createFilter();
}
