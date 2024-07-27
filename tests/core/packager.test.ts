import { expect, test, vi, describe, beforeEach } from 'vitest';
import { pack, Dependencies } from '../../src/core/packager.js';
import path from 'path';
import * as fs from 'fs/promises';
import { Dirent } from 'fs';
import { createMockConfig } from '../testing/testUtils.js';

vi.mock('fs/promises');

describe('packager', () => {
  let mockDeps: Dependencies;

  beforeEach(() => {
    vi.resetAllMocks();
    mockDeps = {
      getGitignorePatterns: vi.fn().mockResolvedValue([]),
      createIgnoreFilter: vi.fn().mockReturnValue(() => true),
      processFile: vi.fn().mockResolvedValue('processed content'),
      generateOutput: vi.fn().mockResolvedValue(undefined),
    };
  });

  test('pack should process files and generate output', async () => {
    const mockConfig = createMockConfig();

    vi.mocked(fs.readdir)
      .mockResolvedValueOnce([
        { name: 'file1.txt', isDirectory: () => false },
        { name: 'dir1', isDirectory: () => true },
      ] as Dirent[])
      .mockResolvedValueOnce([{ name: 'file2.txt', isDirectory: () => false }] as Dirent[]);

    await pack('root', mockConfig, mockDeps);

    expect(fs.readdir).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fs.readdir).mock.calls[0][0]).toBe('root');
    expect(vi.mocked(fs.readdir).mock.calls[1][0]).toBe(path.join('root', 'dir1'));

    expect(mockDeps.generateOutput).toHaveBeenCalledWith('root', mockConfig, [
      { path: 'file1.txt', content: 'processed content' },
      { path: path.join('dir1', 'file2.txt'), content: 'processed content' },
    ]);
  });
});
