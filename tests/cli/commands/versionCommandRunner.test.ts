import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { runVersionCommand } from '../../../src/cli/commands/versionCommandRunner.js';
import * as packageJsonParser from '../../../src/core/file/packageJsonParser.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('../../../src/core/file/packageJsonParser');

describe('versionCommandRunner', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should print the correct version', async () => {
    vi.mocked(packageJsonParser.getVersion).mockResolvedValue('1.2.3');

    const loggerSpy = vi.spyOn(logger, 'log').mockImplementation(vi.fn());
    await runVersionCommand();

    expect(packageJsonParser.getVersion).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith('1.2.3');
  });
});
