import { expect, test, vi, describe, beforeEach } from 'vitest';
import { processFile, preprocessContent } from '../../src/utils/fileHandler.js';
import * as fs from 'fs/promises';

vi.mock('fs/promises');

describe('fileHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('processFile should read and preprocess file content', async () => {
    const mockContent = '  Some file content  \n';
    vi.mocked(fs.readFile).mockResolvedValue(mockContent);

    const result = await processFile('/path/to/file.txt');

    expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.txt');
    expect(result).toBe('Some file content');
  });

  test('preprocessContent should trim content', () => {
    const content = '  Some content with whitespace  \n';
    const result = preprocessContent(content);

    expect(result).toBe('Some content with whitespace');
  });
});
