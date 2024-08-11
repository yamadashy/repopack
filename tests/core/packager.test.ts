import * as fs from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type PackDependencies, pack } from '../../src/core/packager.js';
import { TokenCounter } from '../../src/core/tokenCounter/tokenCounter.js';
import { createMockConfig } from '../testing/testUtils.js';

vi.mock('node:fs/promises');
vi.mock('fs/promises');
vi.mock('../../src/core/security/securityCheckRunner');
vi.mock('../../src/core/tokenCounter/tokenCounter');

describe('packager', () => {
  let mockDeps: PackDependencies;

  beforeEach(() => {
    vi.resetAllMocks();
    const file2Path = path.join('dir1', 'file2.txt');
    mockDeps = {
      searchFiles: vi.fn().mockResolvedValue(['file1.txt', file2Path]),
      collectFiles: vi.fn().mockResolvedValue([
        { path: 'file1.txt', content: 'raw content 1' },
        { path: file2Path, content: 'raw content 2' },
      ]),
      processFiles: vi.fn().mockReturnValue([
        { path: 'file1.txt', content: 'processed content 1' },
        { path: file2Path, content: 'processed content 2' },
      ]),
      runSecurityCheck: vi.fn().mockResolvedValue([]),
      generateOutput: vi.fn().mockResolvedValue('mock output'),
    };

    vi.mocked(TokenCounter.prototype.countTokens).mockReturnValue(10);
  });

  test('pack should process files and generate output', async () => {
    const mockConfig = createMockConfig();

    const result = await pack('root', mockConfig, () => {}, mockDeps);

    const file2Path = path.join('dir1', 'file2.txt');

    expect(mockDeps.searchFiles).toHaveBeenCalledWith('root', mockConfig);
    expect(mockDeps.collectFiles).toHaveBeenCalledWith(['file1.txt', file2Path], 'root');
    expect(mockDeps.runSecurityCheck).toHaveBeenCalled();
    expect(mockDeps.processFiles).toHaveBeenCalled();
    expect(mockDeps.generateOutput).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();

    expect(mockDeps.processFiles).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          content: 'raw content 1',
          path: 'file1.txt',
        }),
        expect.objectContaining({
          content: 'raw content 2',
          path: file2Path,
        }),
      ],
      mockConfig,
    );
    expect(mockDeps.generateOutput).toHaveBeenCalledWith(
      'root',
      mockConfig,
      [
        expect.objectContaining({
          content: 'processed content 1',
          path: 'file1.txt',
        }),
        expect.objectContaining({
          content: 'processed content 2',
          path: file2Path,
        }),
      ],
      ['file1.txt', file2Path],
    );

    // Check the result of pack function
    expect(result.totalFiles).toBe(2);
    expect(result.totalCharacters).toBe(38);
    expect(result.totalTokens).toBe(20);
    expect(result.fileCharCounts).toEqual({
      'file1.txt': 19,
      [file2Path]: 19,
    });
    expect(result.fileTokenCounts).toEqual({
      'file1.txt': 10,
      [file2Path]: 10,
    });
  });

  test('pack should handle security check and filter out suspicious files', async () => {
    const mockConfig = createMockConfig();
    const suspiciousFile = 'suspicious.txt';
    const file2Path = path.join('dir1', 'file2.txt');
    vi.mocked(mockDeps.searchFiles).mockResolvedValue(['file1.txt', file2Path, suspiciousFile]);
    vi.mocked(mockDeps.collectFiles).mockResolvedValue([
      { path: 'file1.txt', content: 'raw content 1' },
      { path: file2Path, content: 'raw content 2' },
      { path: suspiciousFile, content: 'suspicious content' },
    ]);

    // Mock the runSecurityCheck to return a suspicious file result
    vi.mocked(mockDeps.runSecurityCheck).mockResolvedValue([
      {
        filePath: path.join('root', suspiciousFile),
        messages: ['Suspicious content detected'],
      },
    ]);

    const result = await pack('root', mockConfig, () => {}, mockDeps);

    expect(mockDeps.searchFiles).toHaveBeenCalledWith('root', mockConfig);
    expect(mockDeps.processFiles).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          content: 'raw content 1',
          path: 'file1.txt',
        }),
        expect.objectContaining({
          content: 'raw content 2',
          path: file2Path,
        }),
        expect.objectContaining({
          content: 'suspicious content',
          path: 'suspicious.txt',
        }),
      ],
      mockConfig,
    );

    expect(result.suspiciousFilesResults).toHaveLength(1);
    expect(result.suspiciousFilesResults[0].filePath).toContain(suspiciousFile);
    expect(result.totalFiles).toBe(2); // Only safe files should be counted
  });
});
