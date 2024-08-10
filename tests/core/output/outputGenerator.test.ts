import { expect, test, vi, describe, beforeEach } from 'vitest';
import { generateOutput } from '../../../src/core/output/outputGenerator.js';
import * as fs from 'fs/promises';
import path from 'path';
import { createMockConfig } from '../../testing/testUtils.js';

vi.mock('fs/promises');

describe('outputGenerator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('generateOutput should write correct content to file', async () => {
    const mockConfig = createMockConfig({
      output: {
        filePath: 'output.txt',
        style: 'plain',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });
    const mockSanitizedFiles = [
      { path: 'file1.txt', content: 'content1' },
      { path: 'dir/file2.txt', content: 'content2' },
    ];

    await generateOutput('root', mockConfig, mockSanitizedFiles, []);

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fs.writeFile).mock.calls[0][0]).toBe(path.resolve('root', 'output.txt'));

    const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
    expect(writtenContent).toContain('Repopack Output File');
    expect(writtenContent).toContain('File: file1.txt');
    expect(writtenContent).toContain('content1');
    expect(writtenContent).toContain('File: dir/file2.txt');
    expect(writtenContent).toContain('content2');
  });
});
