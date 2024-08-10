import path from 'node:path';
import * as fs from 'node:fs/promises';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { sanitizeFile, postprocessContent, sanitizeFiles } from '../../../src/core/file/fileSanitizer.js';
import { createMockConfig } from '../../testing/testUtils.js';

vi.mock('fs/promises');

describe('fileSanitizer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('sanitizeFile should read and preprocess file content', async () => {
    const mockContent = '  Some file content  \n';
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);

    const mockConfig = createMockConfig();
    const result = await sanitizeFile('/path/to/file.txt', mockConfig);

    expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.txt');
    expect(result).toBe('Some file content');
  });

  test('preprocessContent should trim content', () => {
    const content = '  Some content with whitespace  \n';
    const config = createMockConfig({
      output: {
        filePath: 'output.txt',
        style: 'plain',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });
    const result = postprocessContent(content, config);

    expect(result).toBe('Some content with whitespace');
  });

  test('preprocessContent should remove empty lines when configured', () => {
    const content = `
    Some content

    with empty lines

    in between
    `;
    const config = createMockConfig({
      output: {
        filePath: 'output.txt',
        style: 'plain',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: true,
      },
    });
    const result = postprocessContent(content, config);

    expect(result).toBe('Some content\n    with empty lines\n    in between');
  });

  test('preprocessContent should not remove empty lines when not configured', () => {
    const content = `
    Some content

    with empty lines

    in between
    `;
    const config = createMockConfig({
      output: {
        filePath: 'output.txt',
        style: 'plain',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });
    const result = postprocessContent(content, config);

    expect(result).toBe('Some content\n\n    with empty lines\n\n    in between');
  });

  test('sanitizeFiles should process multiple files', async () => {
    const mockConfig = createMockConfig();
    const mockFilePaths = ['file1.txt', 'dir/file2.txt'];
    const mockRootDir = '/mock/root';

    vi.mocked(fs.readFile).mockResolvedValueOnce('content1').mockResolvedValueOnce('content2');

    const result = await sanitizeFiles(mockFilePaths, mockRootDir, mockConfig);

    expect(result).toEqual([
      { path: 'file1.txt', content: 'content1' },
      { path: 'dir/file2.txt', content: 'content2' },
    ]);

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fs.readFile).mock.calls[0][0]).toBe(path.join(mockRootDir, 'file1.txt'));
    expect(vi.mocked(fs.readFile).mock.calls[1][0]).toBe(path.join(mockRootDir, 'dir/file2.txt'));
  });
});
