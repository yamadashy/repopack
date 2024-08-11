import path from 'node:path';
import * as fs from 'node:fs/promises';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { pack, PackDependencies } from '../../src/core/packager.js';
import { createMockConfig } from '../testing/testUtils.js';

vi.mock('fs/promises');

describe('packager', () => {
  let mockDeps: PackDependencies;

  beforeEach(() => {
    vi.resetAllMocks();
    const file2Path = path.join('dir1', 'file2.txt');
    mockDeps = {
      searchFiles: vi.fn().mockResolvedValue(['file1.txt', file2Path]),
      generateOutput: vi.fn().mockResolvedValue(undefined),
      sanitizeFiles: vi.fn().mockResolvedValue([
        { path: 'file1.txt', content: 'processed content 1' },
        { path: file2Path, content: 'processed content 2' },
      ]),
    };
  });

  test('pack should process files and generate output', async () => {
    const mockConfig = createMockConfig();

    const file2Path = path.join('dir1', 'file2.txt');
    const result = await pack('root', mockConfig, mockDeps);

    expect(mockDeps.searchFiles).toHaveBeenCalledWith('root', mockConfig);

    expect(mockDeps.sanitizeFiles).toHaveBeenCalledWith(['file1.txt', file2Path], 'root', mockConfig);
    expect(mockDeps.generateOutput).toHaveBeenCalledWith(
      mockConfig,
      [
        { path: 'file1.txt', content: 'processed content 1' },
        { path: file2Path, content: 'processed content 2' },
      ],
      ['file1.txt', file2Path],
    );

    // Check the result of pack function
    expect(result.totalFiles).toBe(2);
    expect(result.totalCharacters).toBe(38); // 'processed content 1' + 'processed content 2'
    expect(result.fileCharCounts).toEqual({
      'file1.txt': 19,
      [file2Path]: 19,
    });
  });

  test('pack should handle empty filtered files list', async () => {
    const mockConfig = createMockConfig();
    vi.mocked(mockDeps.searchFiles).mockResolvedValue([]);

    vi.mocked(mockDeps.sanitizeFiles).mockResolvedValue([]);

    const result = await pack('root', mockConfig, mockDeps);

    expect(mockDeps.searchFiles).toHaveBeenCalledWith('root', mockConfig);
    expect(mockDeps.sanitizeFiles).toHaveBeenCalledWith([], 'root', mockConfig);
    expect(mockDeps.generateOutput).toHaveBeenCalledWith(mockConfig, [], []);

    expect(result.totalFiles).toBe(0);
    expect(result.totalCharacters).toBe(0);
    expect(result.fileCharCounts).toEqual({});
  });

  test('pack should handle security check and filter out suspicious files', async () => {
    const mockConfig = createMockConfig();
    const suspiciousFile = 'suspicious.txt';
    const file2Path = path.join('dir1', 'file2.txt');
    vi.mocked(mockDeps.searchFiles).mockResolvedValue(['file1.txt', file2Path, suspiciousFile]);

    // Mock fs.readFile to return content for security check
    vi.mocked(fs.readFile).mockImplementation((filepath) => {
      if (filepath.toString().includes(suspiciousFile)) {
        // secretlint-disable
        return Promise.resolve('URL: https://user:pass@example.com');
        // secretlint-enable
      }
      return Promise.resolve('normal content');
    });

    const result = await pack('root', mockConfig, mockDeps);

    expect(mockDeps.searchFiles).toHaveBeenCalledWith('root', mockConfig);
    expect(mockDeps.sanitizeFiles).toHaveBeenCalledWith(['file1.txt', file2Path], 'root', mockConfig);

    expect(result.suspiciousFilesResults).toHaveLength(1);
    expect(result.suspiciousFilesResults[0].filePath).toContain(suspiciousFile);
  });
});
