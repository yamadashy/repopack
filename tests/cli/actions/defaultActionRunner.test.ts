import process from 'node:process';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { runDefaultAction } from '../../../src/cli/actions/defaultActionRunner.js';
import * as packager from '../../../src/core/packager.js';
import * as configLoader from '../../../src/config/configLoader.js';
import * as packageJsonParser from '../../../src/core/file/packageJsonParser.js';
import { CliOptions } from '../../../src/cli/cliRunner.js';

vi.mock('../../../src/core/packager');
vi.mock('../../../src/config/configLoader');
vi.mock('../../../src/core/file/packageJsonParser');
vi.mock('../../../src/shared/logger');

describe('defaultActionRunner', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(packageJsonParser.getVersion).mockResolvedValue('1.0.0');
    vi.mocked(configLoader.loadFileConfig).mockResolvedValue({});
    vi.mocked(configLoader.mergeConfigs).mockReturnValue({
      cwd: process.cwd(),
      output: {
        filePath: 'output.txt',
        style: 'plain',
        topFilesLength: 5,
        showLineNumbers: false,
        removeComments: false,
        removeEmptyLines: false,
      },
      ignore: {
        useGitignore: true,
        useDefaultPatterns: true,
        customPatterns: [],
      },
      include: [],
    });
    vi.mocked(packager.pack).mockResolvedValue({
      totalFiles: 10,
      totalCharacters: 1000,
      totalTokens: 200,
      fileCharCounts: {},
      fileTokenCounts: {},
      suspiciousFilesResults: [],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should run the default command successfully', async () => {
    const options: CliOptions = {
      output: 'custom-output.txt',
      verbose: true,
    };

    await runDefaultAction('.', process.cwd(), options);

    expect(configLoader.loadFileConfig).toHaveBeenCalled();
    expect(configLoader.mergeConfigs).toHaveBeenCalled();
    expect(packager.pack).toHaveBeenCalled();
  });

  it('should handle custom include patterns', async () => {
    const options: CliOptions = {
      include: '*.js,*.ts',
    };

    await runDefaultAction('.', process.cwd(), options);

    expect(configLoader.mergeConfigs).toHaveBeenCalledWith(
      process.cwd(),
      expect.anything(),
      expect.objectContaining({
        include: ['*.js', '*.ts'],
      }),
    );
  });

  it('should handle custom ignore patterns', async () => {
    const options: CliOptions = {
      ignore: 'node_modules,*.log',
    };

    await runDefaultAction('.', process.cwd(), options);

    expect(configLoader.mergeConfigs).toHaveBeenCalledWith(
      process.cwd(),
      expect.anything(),
      expect.objectContaining({
        ignore: {
          customPatterns: ['node_modules', '*.log'],
        },
      }),
    );
  });

  it('should handle custom output style', async () => {
    const options: CliOptions = {
      style: 'xml',
    };

    await runDefaultAction('.', process.cwd(), options);

    expect(configLoader.mergeConfigs).toHaveBeenCalledWith(
      process.cwd(),
      expect.anything(),
      expect.objectContaining({
        output: expect.objectContaining({
          style: 'xml',
        }),
      }),
    );
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(packager.pack).mockRejectedValue(new Error('Test error'));

    const options: CliOptions = {};

    await expect(runDefaultAction('.', process.cwd(), options)).rejects.toThrow('Test error');
  });
});
