import { expect, test, vi, describe, beforeEach } from 'vitest';
import {
  generateCommonData,
  generateOutput,
  generatePlainOutput,
  generateXmlOutput,
} from '../../src/core/outputGenerator.js';
import * as fs from 'fs/promises';
import path from 'path';
import { createMockConfig } from '../testing/testUtils.js';

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

  test('generatePlainOutput should include user-provided header text', async () => {
    const mockConfig = createMockConfig({
      output: {
        filePath: 'output.txt',
        style: 'plain',
        headerText: 'Custom header text',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });

    const commonData = generateCommonData(mockConfig, [], []);
    const output = await generatePlainOutput(commonData);

    expect(output).toContain('Repopack Output File');
    expect(output).toContain('Custom header text');
  });

  test('generateXmlOutput should include user-provided header text', async () => {
    const mockConfig = createMockConfig({
      output: {
        filePath: 'output.txt',
        style: 'xml',
        headerText: 'Custom header text',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });

    const commonData = generateCommonData(mockConfig, [], []);
    const output = await generateXmlOutput(commonData);

    expect(output).toContain('Repopack Output File');
    expect(output).toContain('Custom header text');
  });
});
