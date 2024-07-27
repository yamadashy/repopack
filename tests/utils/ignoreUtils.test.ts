import { expect, test, vi, describe, beforeEach } from 'vitest';
import {
  getIgnorePatterns,
  parseIgnoreContent,
  createIgnoreFilter,
  getAllIgnorePatterns,
} from '../../src/utils/ignoreUtils.js';
import path from 'path';
import * as fs from 'fs/promises';
import os from 'os';
import { createMockConfig } from '../testing/testUtils.js';

vi.mock('fs/promises');

const isWindows = os.platform() === 'win32';

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

  describe('createIgnoreFilter', () => {
    test('should create a function that correctly filters paths', () => {
      const patterns = ['node_modules', '*.log', '.DS_Store'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('src/index.js')).toBe(true);
      expect(filter('node_modules/package/index.js')).toBe(false);
      expect(filter('logs/error.log')).toBe(false);
      expect(filter('.DS_Store')).toBe(false);
    });

    test('should correctly ignore files with different path separators', () => {
      const patterns = ['*.md', '*.svg', '*.css', 'node_modules/**'];
      const filter = createIgnoreFilter(patterns);

      // UNIX-style paths
      expect(filter('README.md')).toBe(false);
      expect(filter('src/assets/logo.svg')).toBe(false);
      expect(filter('styles/main.css')).toBe(false);
      expect(filter('node_modules/package/index.js')).toBe(false);

      // Files that should not be ignored
      expect(filter('src/index.js')).toBe(true);
    });

    test.runIf(isWindows)('should correctly ignore files with Windows-style paths', () => {
      const patterns = ['*.md', '*.svg', '*.css', 'node_modules/**'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('docs\\README.md')).toBe(false);
      expect(filter('src\\assets\\logo.svg')).toBe(false);
      expect(filter('styles\\main.css')).toBe(false);
      expect(filter('node_modules\\package\\index.js')).toBe(false);
      expect(filter('src\\components\\Button.js')).toBe(true);
    });

    test('should handle nested directory patterns correctly', () => {
      const patterns = ['test/**/*.spec.js', 'build/**'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('test/unit/component.spec.js')).toBe(false);
      expect(filter('build/output.js')).toBe(false);
      expect(filter('src/test/helper.js')).toBe(true);
    });

    test.runIf(isWindows)('should handle nested directory patterns with Windows-style paths', () => {
      const patterns = ['test/**/*.spec.js', 'build/**'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('test\\unit\\component.spec.js')).toBe(false);
      expect(filter('build\\output.js')).toBe(false);
      expect(filter('src\\test\\helper.js')).toBe(true);
    });

    test('should correctly handle patterns with special characters', () => {
      const patterns = ['**/*.min.js', '**/#temp#', '**/node_modules'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('dist/bundle.min.js')).toBe(false);
      expect(filter('temp/#temp#/file.txt')).toBe(false);
      expect(filter('project/node_modules/package/index.js')).toBe(false);

      expect(filter('src/app.js')).toBe(true);
      expect(filter('docs/temp/file.txt')).toBe(true);
    });

    test('should handle case sensitivity correctly', () => {
      const patterns = ['*.MD', 'TEST'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('readme.md')).toBe(false);
      expect(filter('test/file.txt')).toBe(false);

      expect(filter('README.MD')).toBe(false);
      expect(filter('TEST/file.txt')).toBe(false);
    });
  });

  describe('getAllIgnorePatterns', () => {
    test('should merge patterns from .gitignore and .repopackignore when useGitignorePatterns is true', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignorePatterns: true,
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

    test('should only use .repopackignore when useGitignorePatterns is false', async () => {
      const mockConfig = createMockConfig({
        ignore: {
          useGitignorePatterns: false,
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
          useGitignorePatterns: true,
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
