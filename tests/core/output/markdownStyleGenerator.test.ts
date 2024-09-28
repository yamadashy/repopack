import process from 'node:process';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateMarkdownStyle } from '../../../src/core/output/markdownStyleGenerator.js';
import { buildOutputGeneratorContext } from '../../../src/core/output/outputGenerator.js';
import { createMockConfig } from '../../testing/testUtils.js';

vi.mock('fs/promises');

describe('outputGenerator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('generateMarkdownOutput should include user-provided header text', async () => {
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

    const context = await buildOutputGeneratorContext(process.cwd(), mockConfig, [], []);
    const output = await generateMarkdownStyle(context);

    expect(output).toContain('# File Summary');
    expect(output).toContain('# Repository Structure');
    expect(output).toContain('# Repository Files');
  });
});
