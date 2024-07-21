import { expect, test, vi, describe, beforeEach } from 'vitest';
import { getGitignorePatterns, parseGitignoreContent, createIgnoreFilter } from '../../src/utils/gitignoreUtils.js';
import path from 'path';
import * as fs from 'fs/promises';
import os from 'os';

vi.mock('fs/promises');

describe('gitignoreUtils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getGitignorePatterns', () => {
    test('should read and parse .gitignore file', async () => {
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

    test('should return empty array if .gitignore is not found', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const patterns = await getGitignorePatterns('/mock/root');

      expect(patterns).toEqual([]);
    });

    test('should handle CRLF line endings', async () => {
      const mockContent = 'node_modules\r\n*.log\r\n.DS_Store';
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const patterns = await getGitignorePatterns('/mock/root');

      expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
    });
  });

  describe('parseGitignoreContent', () => {
    test('should correctly parse gitignore content', () => {
      const content = `
# Comment
node_modules
*.log

.DS_Store
      `;

      const patterns = parseGitignoreContent(content);

      expect(patterns).toEqual(['node_modules', '*.log', '.DS_Store']);
    });

    test('should handle mixed line endings', () => {
      const content = 'node_modules\n*.log\r\n.DS_Store\r';

      const patterns = parseGitignoreContent(content);

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

      // Windows-style paths
      if (os.platform() === 'win32') {
        expect(filter('docs\\README.md')).toBe(false);
        expect(filter('src\\assets\\logo.svg')).toBe(false);
        expect(filter('styles\\main.css')).toBe(false);
        expect(filter('node_modules\\package\\index.js')).toBe(false);
        expect(filter('src\\components\\Button.js')).toBe(true);
      }

      // Files that should not be ignored
      expect(filter('src/index.js')).toBe(true);
    });

    test('should handle nested directory patterns correctly', () => {
      const patterns = ['test/**/*.spec.js', 'build/**'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('test/unit/component.spec.js')).toBe(false);
      expect(filter('build/output.js')).toBe(false);

      expect(filter('src/test/helper.js')).toBe(true);

      if (os.platform() === 'win32') {
        expect(filter('src\\build\\utils.js')).toBe(true);
        expect(filter('test\\integration\\api.spec.js')).toBe(false);
        expect(filter('build\\temp\\cache.json')).toBe(false);
      }
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

    test('should handle case sensitivity correctly on different platforms', () => {
      const patterns = ['*.MD', 'TEST'];
      const filter = createIgnoreFilter(patterns);

      if (os.platform() === 'win32') {
        // Windows is case-insensitive
        expect(filter('readme.md')).toBe(false);
        expect(filter('test/file.txt')).toBe(false);
      } else {
        // Unix-like systems are case-insensitive
        expect(filter('readme.md')).toBe(false);
        expect(filter('test/file.txt')).toBe(false);
      }

      expect(filter('README.MD')).toBe(false);
      expect(filter('TEST/file.txt')).toBe(false);
    });

    test('should handle symlinks correctly', () => {
      const patterns = ['symlink', 'real_dir'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('symlink')).toBe(false);
      expect(filter('real_dir')).toBe(false);
      expect(filter('symlink/file.txt')).toBe(false);
      expect(filter('real_dir/file.txt')).toBe(false);
    });

    test('should handle long paths correctly', () => {
      const longPath = 'a'.repeat(200) + '/file.txt';
      const patterns = ['**/*.txt'];
      const filter = createIgnoreFilter(patterns);

      expect(filter(longPath)).toBe(false);
    });

    test('should handle Unicode characters in paths and patterns', () => {
      const patterns = ['📁/*', '*.🚀'];
      const filter = createIgnoreFilter(patterns);

      expect(filter('📁/file.txt')).toBe(false);
      expect(filter('document.🚀')).toBe(false);
      expect(filter('normal/path/file.txt')).toBe(true);
    });
  });
});
