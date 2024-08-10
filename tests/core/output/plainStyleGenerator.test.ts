import { expect, test, vi, describe, beforeEach } from 'vitest';
import { generatePlainStyle } from '../../../src/core/output/plainStyleGenerator.js';
import { createMockConfig } from '../../testing/testUtils.js';
import { buildOutputGeneratorContext } from '../../../src/core/output/outputGenerator.js';

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

    const commonData = buildOutputGeneratorContext(mockConfig, [], []);
    const output = await generatePlainStyle(commonData);

    expect(output).toContain('Repopack Output File');
    expect(output).toContain('Custom header text');
  });
});
