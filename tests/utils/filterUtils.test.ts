import { expect, test, vi, describe, beforeEach } from 'vitest';
import { getIgnorePatterns, parseIgnoreContent, getIgnoreFilePaths, filterFiles } from '../../src/utils/filterUtils.js';
import path from 'path';
import * as fs from 'fs/promises';
import { createMockConfig } from '../testing/testUtils.js';
import { globby } from 'globby';

vi.mock('fs/promises');
vi.mock('globby');

describe('filterUtils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getIgnoreFilePaths', () => {
    test('should return correct paths when .gitignore and .repopackignore exist', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: [],
        },
      });

      vi.mocked(fs.access).mockResolvedValue(undefined);

      const paths = await getIgnoreFilePaths('/mock/root', mockConfig);

      expect(paths).toEqual([
        path.join('/mock/root', '.gitignore'),
        path.join('/mock/root', '.repopackignore'),
      ]);
    });

    test('should not include .gitignore when useGitignore is false', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: false,
          useDefaultPatterns: true,
          customPatterns: [],
        },
      });

      vi.mocked(fs.access).mockResolvedValue(undefined);

      const paths = await getIgnoreFilePaths('/mock/root', mockConfig);

      expect(paths).toEqual([path.join('/mock/root', '.repopackignore')]);
    });

    test('should handle missing .repopackignore', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: [],
        },
      });

      vi.mocked(fs.access).mockImplementation((path) => {
        if (path.toString().includes('.repopackignore')) {
          return Promise.reject(new Error('File not found'));
        }
        return Promise.resolve(undefined);
      });

      const paths = await getIgnoreFilePaths('/mock/root', mockConfig);

      expect(paths).toEqual([path.join('/mock/root', '.gitignore')]);
    });
  });

  describe('getIgnorePatterns', () => {
    test('should return default patterns when useDefaultPatterns is true', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: [],
        },
      });

      const patterns = await getIgnorePatterns(mockConfig);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns).toContain('node_modules/**');
    });

    test('should include custom patterns', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: false,
          customPatterns: ['*.custom', 'temp/'],
        },
      });

      const patterns = await getIgnorePatterns(mockConfig);

      expect(patterns).toEqual(['*.custom', 'temp/']);
    });

    test('should combine default and custom patterns', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: ['*.custom', 'temp/'],
        },
      });

      const patterns = await getIgnorePatterns(mockConfig);

      expect(patterns).toContain('node_modules/**');
      expect(patterns).toContain('*.custom');
      expect(patterns).toContain('temp/');
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

  describe('filterFiles', () => {
    test('should call globby with correct parameters', async () => {
      const mockConfig = createMockConfig({
        include: ['**/*.js'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: ['*.custom'],
        },
      });

      vi.mocked(globby).mockResolvedValue(['file1.js', 'file2.js']);
      vi.mocked(fs.access).mockResolvedValue(undefined);

      await filterFiles('/mock/root', mockConfig);

      expect(globby).toHaveBeenCalledWith(
        ['**/*.js'],
        expect.objectContaining({
          cwd: '/mock/root',
          ignore: expect.arrayContaining(['*.custom']),
          ignoreFiles: expect.arrayContaining([
            path.join('/mock/root', '.gitignore'),
            path.join('/mock/root', '.repopackignore'),
          ]),
          onlyFiles: true,
          absolute: false,
          dot: true,
          followSymbolicLinks: false,
        })
      );
    });
  });
});
