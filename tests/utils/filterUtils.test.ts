import { expect, test, vi, describe, beforeEach } from 'vitest';
import { getIgnorePatterns, parseIgnoreContent, getAllIgnorePatterns } from '../../src/utils/filterUtils.js';
import path from 'path';
import * as fs from 'fs/promises';
import { createMockConfig } from '../testing/testUtils.js';

vi.mock('fs/promises');

describe('ignoreUtils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getIgnorePatterns', () => {
    test('should read and parse .gitignore file', async () => {
      const mockContent = `
# Comment
node_modules
*.log
.DS_Store
      `;
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const patterns = await getIgnorePatterns('.gitignore', '/mock/root');

      expect(fs.readFile).toHaveBeenCalledWith(path.join('/mock/root', '.gitignore'), 'utf-8');
      expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
    });

    test('should return empty array if ignore file is not found', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const patterns = await getIgnorePatterns('.repopackignore', '/mock/root');

      expect(patterns).toEqual([]);
    });

    test('should handle CRLF line endings', async () => {
      const mockContent = 'node_modules\r\n*.log\r\n.DS_Store';
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const patterns = await getIgnorePatterns('.gitignore', '/mock/root');

      expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
    });
  });

  describe('parseIgnoreContent', () => {
    test('should correctly parse ignore content', () => {
      const content = `
# Comment
node_modules
*.log

.DS_Store
      `;

      const patterns = parseIgnoreContent(content);

      expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
    });

    test('should handle mixed line endings', () => {
      const content = 'node_modules\n*.log\r\n.DS_Store\r';

      const patterns = parseIgnoreContent(content);

      expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
    });
  });

  describe('getAllIgnorePatterns', () => {
    test('should merge patterns from .gitignore and .repopackignore when useGitignore is true', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: false,
          customPatterns: [],
        },
      });

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('node_modules\n*.log') // .gitignore
        .mockResolvedValueOnce('dist\n*.tmp'); // .repopackignore

      const patterns = await getAllIgnorePatterns('/mock/root', mockConfig);

      expect(patterns).toEqual(['node_modules', '*.log', 'dist', '*.tmp']);
    });

    test('should only use .repopackignore when useGitignore is false', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: false,
          useDefaultPatterns: false,
          customPatterns: [],
        },
      });

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('node_modules\n*.log') // .gitignore (should be ignored)
        .mockResolvedValueOnce('dist\n*.tmp'); // .repopackignore

      const patterns = await getAllIgnorePatterns('/mock/root', mockConfig);

      expect(patterns).toEqual(['dist', '*.tmp']);
    });

    test('should include custom patterns when provided', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: false,
          customPatterns: ['*.custom', 'temp/'],
        },
      });

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('node_modules\n*.log') // .gitignore
        .mockResolvedValueOnce('dist\n*.tmp'); // .repopackignore

      const patterns = await getAllIgnorePatterns('/mock/root', mockConfig);

      expect(patterns).toEqual(['node_modules', '*.log', 'dist', '*.tmp', '*.custom', 'temp/']);
    });
  });
});
