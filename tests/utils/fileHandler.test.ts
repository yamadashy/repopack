import { expect, test, vi, describe, beforeEach } from 'vitest';
import { processFile, preprocessContent } from '../../src/utils/fileHandler.js';
import * as fs from 'fs/promises';
import { createMockConfig } from '../testing/testUtils.js';

vi.mock('fs/promises');

describe('fileHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('processFile should read and preprocess file content', async () => {
    const mockContent = '  Some file content  \n';
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);

    const mockConfig = createMockConfig();
    const result = await processFile('/path/to/file.txt', mockConfig);

    expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.txt');
    expect(result).toBe('Some file content');
  });

  test('preprocessContent should trim content', () => {
    const content = '  Some content with whitespace  \n';
    const config = createMockConfig({
      output: {
        filePath: 'output.txt',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });
    const result = preprocessContent(content, config);

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
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: true,
      },
    });
    const result = preprocessContent(content, config);

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
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });
    const result = preprocessContent(content, config);

    expect(result).toBe('Some content\n\n    with empty lines\n\n    in between');
  });
});
