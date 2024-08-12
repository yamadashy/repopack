import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { runVersionAction } from '../../../src/cli/actions/versionActionRunner.js';
import * as packageJsonParser from '../../../src/core/file/packageJsonParser.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('../../../src/core/file/packageJsonParser');

describe('versionActionRunner', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should print the correct version', async () => {
    vi.mocked(packageJsonParser.getVersion).mockResolvedValue('1.2.3');

    const loggerSpy = vi.spyOn(logger, 'log').mockImplementation(vi.fn());
    await runVersionAction();

    expect(packageJsonParser.getVersion).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith('1.2.3');
  });
});
