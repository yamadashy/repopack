import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as defaultAction from '../../src/cli/actions/defaultAction.js';
import * as initAction from '../../src/cli/actions/initAction.js';
import * as remoteAction from '../../src/cli/actions/remoteAction.js';
import * as versionAction from '../../src/cli/actions/versionAction.js';
import { executeAction, run } from '../../src/cli/cliRun.js';
import type { RepomixConfigMerged } from '../../src/config/configSchema.js';
import type { PackResult } from '../../src/core/packager.js';
import { logger } from '../../src/shared/logger.js';

vi.mock('../../src/shared/logger', () => ({
  logger: {
    log: vi.fn(),
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    note: vi.fn(),
    setVerbose: vi.fn(),
  },
}));

vi.mock('commander', () => ({
  program: {
    description: vi.fn().mockReturnThis(),
    arguments: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parseAsync: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../src/cli/actions/defaultAction');
vi.mock('../../src/cli/actions/initAction');
vi.mock('../../src/cli/actions/remoteAction');
vi.mock('../../src/cli/actions/versionAction');

describe('cliRun', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(defaultAction.runDefaultAction).mockResolvedValue({
      config: {
        cwd: process.cwd(),
        output: {
          filePath: 'repomix-output.txt',
          style: 'plain',
          topFilesLength: 5,
          showLineNumbers: false,
          removeComments: false,
          removeEmptyLines: false,
          copyToClipboard: false,
        },
        include: [],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: [],
        },
        security: {
          enableSecurityCheck: true,
        },
      } satisfies RepomixConfigMerged,
      packResult: {
        totalFiles: 0,
        totalCharacters: 0,
        totalTokens: 0,
        fileCharCounts: {},
        fileTokenCounts: {},
        suspiciousFilesResults: [],
      } satisfies PackResult,
    });
    vi.mocked(initAction.runInitAction).mockResolvedValue();
    vi.mocked(remoteAction.runRemoteAction).mockResolvedValue();
    vi.mocked(versionAction.runVersionAction).mockResolvedValue();
  });

  test('should run without arguments', async () => {
    await expect(run()).resolves.not.toThrow();
  });

  describe('executeAction', () => {
    test('should execute default action when no special options provided', async () => {
      await executeAction('.', process.cwd(), {});

      expect(defaultAction.runDefaultAction).toHaveBeenCalledWith('.', process.cwd(), expect.any(Object));
    });

    test('should enable verbose logging when verbose option is true', async () => {
      await executeAction('.', process.cwd(), { verbose: true });

      expect(logger.setVerbose).toHaveBeenCalledWith(true);
    });

    test('should execute version action when version option is true', async () => {
      await executeAction('.', process.cwd(), { version: true });

      expect(versionAction.runVersionAction).toHaveBeenCalled();
      expect(defaultAction.runDefaultAction).not.toHaveBeenCalled();
    });

    test('should execute init action when init option is true', async () => {
      await executeAction('.', process.cwd(), { init: true });

      expect(initAction.runInitAction).toHaveBeenCalledWith(process.cwd(), false);
      expect(defaultAction.runDefaultAction).not.toHaveBeenCalled();
    });

    test('should execute remote action when remote option is provided', async () => {
      await executeAction('.', process.cwd(), { remote: 'yamadashy/repomix' });

      expect(remoteAction.runRemoteAction).toHaveBeenCalledWith('yamadashy/repomix', expect.any(Object));
      expect(defaultAction.runDefaultAction).not.toHaveBeenCalled();
    });
  });
});
