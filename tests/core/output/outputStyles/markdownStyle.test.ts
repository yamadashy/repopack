import process from 'node:process';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateOutput } from '../../../../src/core/output/outputGenerate.js';
import { createMockConfig } from '../../../testing/testUtils.js';

vi.mock('fs/promises');

describe('markdownStyle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('generateOutput for md should include user-provided header text', async () => {
    const mockConfig = createMockConfig({
      output: {
        filePath: 'output.md',
        style: 'markdown',
        headerText: 'Custom header text',
        topFilesLength: 2,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
    });

    const output = await generateOutput(process.cwd(), mockConfig, [], []);


    expect(output).toContain('# File Summary');
    expect(output).toContain('# Repository Structure');
    expect(output).toContain('# Repository Files');
  });
});
