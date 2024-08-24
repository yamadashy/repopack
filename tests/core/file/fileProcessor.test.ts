import { expect, describe, it, vi } from 'vitest';
import { processFiles, processContent } from '../../../src/core/file/fileProcessor.js';
import { getFileManipulator } from '../../../src/core/file/fileManipulator.js';
import { RawFile } from '../../../src/core/file/fileTypes.js';
import { createMockConfig } from '../../testing/testUtils.js';

vi.mock('../../../src/core/file/fileManipulator');

describe('fileProcessor', () => {
  describe('processFiles', () => {
    it('should process multiple files', async () => {
      const mockRawFiles: RawFile[] = [
        { path: 'file1.js', content: '// comment\nconst a = 1;' },
        { path: 'file2.js', content: '/* comment */\nconst b = 2;' },
      ];
      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      });

      vi.mocked(getFileManipulator).mockReturnValue({
        removeComments: (content: string) => content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''),
        removeEmptyLines: (content: string) => content.replace(/^\s*[\r\n]/gm, ''),
      });

      const result = await processFiles(mockRawFiles, config);

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
      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      });

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
      const config = createMockConfig({
        output: {
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe(content.trim());
    });

    it('should handle files without a manipulator', async () => {
      const content = 'Some content';
      const filePath = 'unknown.ext';
      const config = createMockConfig({
        output: {
          removeComments: true,
          removeEmptyLines: true,
        },
      });

      vi.mocked(getFileManipulator).mockReturnValue(null);

      const result = await processContent(content, filePath, config);

      expect(result).toBe(content);
    });

    it('should add line numbers when showLineNumbers is true', async () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const filePath = 'test.txt';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe('1: Line 1\n2: Line 2\n3: Line 3');
    });

    it('should not add line numbers when showLineNumbers is false', async () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const filePath = 'test.txt';
      const config = createMockConfig({
        output: {
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle empty content when showLineNumbers is true', async () => {
      const content = '';
      const filePath = 'empty.txt';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      expect(result).toBe('1: ');
    });

    it('should pad line numbers correctly for files with many lines', async () => {
      const content = Array(100).fill('Line').join('\n');
      const filePath = 'long.txt';
      const config = createMockConfig({
        output: {
          showLineNumbers: true,
          removeComments: false,
          removeEmptyLines: false,
        },
      });

      const result = await processContent(content, filePath, config);

      const lines = result.split('\n');
      expect(lines[0]).toBe('  1: Line');
      expect(lines[9]).toBe(' 10: Line');
      expect(lines[99]).toBe('100: Line');
    });
  });
});
