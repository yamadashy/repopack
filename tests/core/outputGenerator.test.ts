import { expect, test, vi, describe, beforeEach } from 'vitest';
import { generateOutput, generateFileHeader } from '../../src/core/outputGenerator.js';
import { RepopackConfig } from '../../src/types/index.js';
import * as fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises');

describe('outputGenerator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('generateOutput should write correct content to file', async () => {
    const mockConfig: RepopackConfig = {
      output: { filePath: 'output.txt' },
      ignore: { useDefaultPatterns: true },
    };
    const mockPackedFiles = [
      { path: 'file1.txt', content: 'content1' },
      { path: 'dir/file2.txt', content: 'content2' },
    ];

    await generateOutput('root', mockConfig, mockPackedFiles);

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fs.writeFile).mock.calls[0][0]).toBe(path.resolve('root', 'output.txt'));

    const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
    expect(writtenContent).toContain('REPOPACK OUTPUT FILE');
    expect(writtenContent).toContain('File: file1.txt');
    expect(writtenContent).toContain('content1');
    expect(writtenContent).toContain('File: dir/file2.txt');
    expect(writtenContent).toContain('content2');
  });

  test('generateFileHeader should include user-provided header text', () => {
    const mockConfig: RepopackConfig = {
      output: {
        filePath: 'output.txt',
        headerText: 'Custom header text',
      },
      ignore: { useDefaultPatterns: true },
    };

    const header = generateFileHeader(mockConfig);

    expect(header).toContain('REPOPACK OUTPUT FILE');
    expect(header).toContain('Custom header text');
  });
});
