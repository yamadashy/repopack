import * as fs from 'node:fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { collectFiles } from '../../../src/core/file/fileCollect.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('node:fs/promises');
vi.mock('istextorbinary');
vi.mock('jschardet');
vi.mock('iconv-lite');
vi.mock('../../../src/shared/logger');

describe('fileCollect', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should collect non-binary files', async () => {
    const mockFilePaths = ['file1.txt', 'file2.txt'];
    const mockRootDir = '/root';

    vi.mocked(isBinary).mockReturnValue(false);
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('file content'));
    vi.mocked(jschardet.detect).mockReturnValue({ encoding: 'utf-8', confidence: 0.99 });
    vi.mocked(iconv.decode).mockReturnValue('decoded content');

    const result = await collectFiles(mockFilePaths, mockRootDir);

    expect(result).toEqual([
      { path: 'file1.txt', content: 'decoded content' },
      { path: 'file2.txt', content: 'decoded content' },
    ]);
  });

  it('should skip binary files', async () => {
    const mockFilePaths = ['binary.bin', 'text.txt'];
    const mockRootDir = '/root';

    vi.mocked(isBinary).mockReturnValueOnce(true).mockReturnValueOnce(false);
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('file content'));
    vi.mocked(jschardet.detect).mockReturnValue({ encoding: 'utf-8', confidence: 0.99 });
    vi.mocked(iconv.decode).mockReturnValue('decoded content');

    const result = await collectFiles(mockFilePaths, mockRootDir);

    expect(result).toEqual([{ path: 'text.txt', content: 'decoded content' }]);
    expect(logger.debug).toHaveBeenCalledWith(`Skipping binary file: ${path.resolve('/root/binary.bin')}`);
  });

  it('should handle file read errors', async () => {
    const mockFilePaths = ['error.txt'];
    const mockRootDir = '/root';

    vi.mocked(isBinary).mockReturnValue(false);
    vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

    const result = await collectFiles(mockFilePaths, mockRootDir);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      `Failed to read file: ${path.resolve('/root/error.txt')}`,
      expect.any(Error),
    );
  });
});
