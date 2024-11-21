import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  checkGitInstallation,
  cleanupTempDirectory,
  copyOutputToCurrentDirectory,
  createTempDirectory,
  formatGitUrl,
  runRemoteAction,
} from '../../../src/cli/actions/remoteAction.js';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    copyFile: vi.fn(),
  };
});
vi.mock('../../../src/shared/logger');

describe('remoteAction functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('runRemoteAction', () => {
    test('should clone the repository', async () => {
      vi.mocked(fs.copyFile).mockResolvedValue(undefined);
      await runRemoteAction('yamadashy/repomix', {});
    });
  });

  describe('checkGitInstallation Integration', () => {
    test('should detect git installation in real environment', async () => {
      const result = await checkGitInstallation();
      expect(result).toBe(true);
    });
  });

  describe('formatGitUrl', () => {
    test('should convert GitHub shorthand to full URL', () => {
      expect(formatGitUrl('user/repo')).toBe('https://github.com/user/repo.git');
      expect(formatGitUrl('user-name/repo-name')).toBe('https://github.com/user-name/repo-name.git');
      expect(formatGitUrl('user_name/repo_name')).toBe('https://github.com/user_name/repo_name.git');
    });

    test('should handle HTTPS URLs', () => {
      expect(formatGitUrl('https://github.com/user/repo')).toBe('https://github.com/user/repo.git');
      expect(formatGitUrl('https://github.com/user/repo.git')).toBe('https://github.com/user/repo.git');
    });

    test('should not modify SSH URLs', () => {
      const sshUrl = 'git@github.com:user/repo.git';
      expect(formatGitUrl(sshUrl)).toBe(sshUrl);
    });
  });

  describe('copyOutputToCurrentDirectory', () => {
    test('should copy output file', async () => {
      const sourceDir = '/source/dir';
      const targetDir = '/target/dir';
      const fileName = 'output.txt';

      vi.mocked(fs.copyFile).mockResolvedValue();

      await copyOutputToCurrentDirectory(sourceDir, targetDir, fileName);

      expect(fs.copyFile).toHaveBeenCalledWith(path.join(sourceDir, fileName), path.join(targetDir, fileName));
    });

    test('should throw error when copy fails', async () => {
      const sourceDir = '/source/dir';
      const targetDir = '/target/dir';
      const fileName = 'output.txt';

      vi.mocked(fs.copyFile).mockRejectedValue(new Error('Permission denied'));

      await expect(copyOutputToCurrentDirectory(sourceDir, targetDir, fileName)).rejects.toThrow(
        'Failed to copy output file',
      );
    });
  });
});
