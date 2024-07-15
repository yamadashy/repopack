import { expect, test, vi, describe, beforeEach } from 'vitest';
import { getGitignorePatterns, parseGitignoreContent, createIgnoreFilter } from '../../src/utils/gitignoreUtils.js';
import path from 'path';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('gitignoreUtils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('getGitignorePatterns should read and parse .gitignore file', async () => {
    const mockContent = `
# Comment
node_modules
*.log
.DS_Store
    `;
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);

    const patterns = await getGitignorePatterns('/mock/root');

    expect(fs.readFile).toHaveBeenCalledWith(path.join('/mock/root', '.gitignore'), 'utf-8');
    expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
  });

  test('getGitignorePatterns should return empty array if .gitignore is not found', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

    const patterns = await getGitignorePatterns('/mock/root');

    expect(patterns).toEqual([]);
  });

  test('parseGitignoreContent should correctly parse gitignore content', () => {
    const content = `
# Comment
node_modules
*.log

.DS_Store
    `;

    const patterns = parseGitignoreContent(content);

    expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
  });

  test('createIgnoreFilter should create a function that correctly filters paths', () => {
    const patterns = ['node_modules', '*.log', '.DS_Store'];
    const filter = createIgnoreFilter(patterns);

    expect(filter('src/index.js')).toBe(true);
    expect(filter('node_modules/package/index.js')).toBe(false);
    expect(filter('logs/error.log')).toBe(false);
    expect(filter('.DS_Store')).toBe(false);
  });
});
