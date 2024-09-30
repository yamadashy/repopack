import process from 'node:process';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildOutputGeneratorContext } from '../../../../src/core/output/outputGenerator.js';
import { generatePlainStyle } from '../../../../src/core/output/styleGenerators/plainStyleGenerator.js';
import { createMockConfig } from '../../../testing/testUtils.js';

vi.mock('fs/promises');

describe('outputGenerator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

    const context = await buildOutputGeneratorContext(process.cwd(), mockConfig, [], []);
    const output = await generatePlainStyle(context);

    expect(output).toContain('File Summary');
    expect(output).toContain('Repository Structure');
    expect(output).toContain('Custom header text');
    expect(output).toContain('Repository Files');
  });
});
