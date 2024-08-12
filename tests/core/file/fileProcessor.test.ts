import { expect, describe, it, vi } from 'vitest';
import { processFiles, processContent } from '../../../src/core/file/fileProcessor.js';
import { getFileManipulator } from '../../../src/core/file/fileManipulater.js';
import { RepopackConfigMerged } from '../../../src/config/configTypes.js';
import { RawFile } from '../../../src/core/file/fileTypes.js';

vi.mock('../../../src/core/file/fileManipulater');

describe('fileProcessor', () => {
  describe('processFiles', () => {
    it('should process multiple files', async () => {
      const mockRawFiles: RawFile[] = [
        { path: 'file1.js', content: '// comment\nconst a = 1;' },
        { path: 'file2.js', content: '/* comment */\nconst b = 2;' },
      ];
      const mockConfig: RepopackConfigMerged = {
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      } as RepopackConfigMerged;

      vi.mocked(getFileManipulator).mockReturnValue({
        removeComments: (content: string) => content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''),
        removeEmptyLines: (content: string) => content.replace(/^\s*[\r\n]/gm, ''),
      });

      const result = await processFiles(mockRawFiles, mockConfig);

      expect(result).toEqual([
        { path: 'file1.js', content: 'const a = 1;' },
        { path: 'file2.js', content: 'const b = 2;' },
      ]);
    });
  });

  describe('processContent', () => {
    it('should remove comments and empty lines when configured', async () => {
      const content = '// comment\nconst a = 1;\n\n/* multi-line\ncomment */\nconst b = 2;';
      const filePath = 'test.js';
      const config: RepopackConfigMerged = {
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      } as RepopackConfigMerged;

      vi.mocked(getFileManipulator).mockReturnValue({
        removeComments: (content: string) => content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''),
        removeEmptyLines: (content: string) => content.replace(/^\s*[\r\n]/gm, ''),
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe('const a = 1;\nconst b = 2;');
    });

    it('should not remove comments or empty lines when not configured', async () => {
      const content = '// comment\nconst a = 1;\n\n/* multi-line\ncomment */\nconst b = 2;';
      const filePath = 'test.js';
      const config: RepopackConfigMerged = {
        output: {
          removeComments: false,
          removeEmptyLines: false,
        },
      } as RepopackConfigMerged;

      const result = await processContent(content, filePath, config);

      expect(result).toBe(content.trim());
    });

    it('should handle files without a manipulator', async () => {
      const content = 'Some content';
      const filePath = 'unknown.ext';
      const config: RepopackConfigMerged = {
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      } as RepopackConfigMerged;

      vi.mocked(getFileManipulator).mockReturnValue(null);

      const result = await processContent(content, filePath, config);

      expect(result).toBe(content);
    });
  });
});
