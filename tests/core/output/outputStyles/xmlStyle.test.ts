import process from 'node:process';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createMockConfig } from '../../../testing/testUtils.js';
import { generateOutput } from '../../../../src/core/output/outputGenerate.js';


vi.mock('fs/promises');

describe('xmlStyle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('generateOutput for xml should include user-provided header text', async () => {
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

    const output = await generateOutput(process.cwd(), mockConfig, [], []);

    expect(output).toContain('file_summary');
    expect(output).toContain('repository_structure');
    expect(output).toContain('Custom header text');
    expect(output).toContain('repository_files');
  });
});
