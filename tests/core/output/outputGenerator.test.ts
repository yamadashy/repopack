import { expect, test, describe } from 'vitest';
import { generateOutput } from '../../../src/core/output/outputGenerator.js';
import { createMockConfig } from '../../testing/testUtils.js';

describe('outputGenerator', () => {
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

    const output = await generateOutput(mockConfig, mockSanitizedFiles, []);

    expect(output).toContain('Repopack Output File');
    expect(output).toContain('File: file1.txt');
    expect(output).toContain('content1');
    expect(output).toContain('File: dir/file2.txt');
    expect(output).toContain('content2');
  });
});
