import * as fs from 'node:fs/promises';
import path from 'node:path';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import * as prompts from '@clack/prompts';
import { runInitAction } from '../../../src/cli/actions/initActionRunner.js';
import { logger } from '../../../src/shared/logger.js';
import { getGlobalDirectory } from '../../../src/config/globalDirectory.js';

vi.mock('node:fs/promises');
vi.mock('@clack/prompts');
vi.mock('../../../src/shared/folderUtils');
vi.mock('../../../src/config/globalDirectory.js');

describe('initActionRunner', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a new local config file when one does not exist', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('File does not exist'));
    vi.mocked(prompts.group).mockResolvedValue({
      outputFilePath: 'custom-output.txt',
      outputStyle: 'xml',
    });

    await runInitAction('/test/dir', false);

    const configPath = path.resolve('/test/dir/repopack.config.json');

    expect(fs.writeFile).toHaveBeenCalledWith(configPath, expect.stringContaining('"filePath": "custom-output.txt"'));
    expect(fs.writeFile).toHaveBeenCalledWith(configPath, expect.stringContaining('"style": "xml"'));
  });

  it('should create a new global config file when one does not exist', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('File does not exist'));
    vi.mocked(prompts.group).mockResolvedValue({
      outputFilePath: 'global-output.txt',
      outputStyle: 'plain',
    });
    vi.mocked(getGlobalDirectory).mockImplementation(() => '/global/repopack');

    await runInitAction('/test/dir', true);

    const configPath = path.resolve('/global/repopack/repopack.config.json');

    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(configPath), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(configPath, expect.stringContaining('"filePath": "global-output.txt"'));
    expect(fs.writeFile).toHaveBeenCalledWith(configPath, expect.stringContaining('"style": "plain"'));
  });

  it('should prompt to overwrite when config file already exists', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(prompts.confirm).mockResolvedValue(true);
    vi.mocked(prompts.group).mockResolvedValue({
      outputFilePath: 'new-output.txt',
      outputStyle: 'xml',
    });

    await runInitAction('/test/dir', false);

    expect(prompts.confirm).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should not overwrite when user chooses not to', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(prompts.confirm).mockResolvedValue(false);

    const loggerSpy = vi.spyOn(logger, 'info').mockImplementation(vi.fn());

    await runInitAction('/test/dir', false);

    expect(prompts.confirm).toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('will not be modified'));
  });

  it('should handle user cancellation', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('File does not exist'));
    vi.mocked(prompts.group).mockImplementation(() => {
      throw new Error('User cancelled');
    });

    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(vi.fn());

    await runInitAction('/test/dir', false);

    expect(fs.writeFile).not.toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith('Failed to create repopack.config.json:', new Error('User cancelled'));
  });
});
