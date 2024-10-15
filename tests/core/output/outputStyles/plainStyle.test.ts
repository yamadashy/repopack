import process from 'node:process';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateOutput } from '../../../../src/core/output/outputGenerate.js';
import { createMockConfig } from '../../../testing/testUtils.js';

vi.mock('fs/promises');

describe('plainStyle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('generateOutput for plain should include user-provided header text', async () => {
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

    const output = await generateOutput(process.cwd(), mockConfig, [], []);

    expect(output).toContain('File Summary');
    expect(output).toContain('Repository Structure');
    expect(output).toContain('Custom header text');
    expect(output).toContain('Repository Files');
  });
});
