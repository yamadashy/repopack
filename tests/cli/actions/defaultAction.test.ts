import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runDefaultAction } from '../../../src/cli/actions/defaultAction.js';
import type { CliOptions } from '../../../src/cli/cliRun.js';
import * as configLoader from '../../../src/config/configLoad.js';
import * as packageJsonParser from '../../../src/core/file/packageJsonParse.js';
import * as packager from '../../../src/core/packager.js';

vi.mock('../../../src/core/packager');
vi.mock('../../../src/config/configLoad');
vi.mock('../../../src/core/file/packageJsonParse');
vi.mock('../../../src/shared/logger');

describe('defaultAction', () => {
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
        copyToClipboard: false,
      },
      ignore: {
        useGitignore: true,
        useDefaultPatterns: true,
        customPatterns: [],
      },
      include: [],
      security: {
        enableSecurityCheck: true,
      },
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
