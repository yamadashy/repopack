import * as fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  cleanupTempDirectory,
  copyOutputToCurrentDirectory,
  createTempDirectory,
  formatGitUrl,
} from '../../../src/cli/actions/remoteAction.js';

vi.mock('node:child_process');
vi.mock('node:fs/promises');
vi.mock('node:os');
vi.mock('../../../src/shared/logger');

describe('remoteAction functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

  describe('createTempDirectory', () => {
    test('should create temporary directory', async () => {
      const mockTempDir = '/mock/temp/dir';
      vi.mocked(os.tmpdir).mockReturnValue('/mock/temp');
      vi.mocked(fs.mkdtemp).mockResolvedValue(mockTempDir);

      const result = await createTempDirectory();
      expect(result).toBe(mockTempDir);
      expect(fs.mkdtemp).toHaveBeenCalledWith(path.join('/mock/temp', 'repomix-'));
    });
  });

  describe('cleanupTempDirectory', () => {
    test('should cleanup directory', async () => {
      const mockDir = '/mock/temp/dir';
      vi.mocked(fs.rm).mockResolvedValue();

      await cleanupTempDirectory(mockDir);

      expect(fs.rm).toHaveBeenCalledWith(mockDir, { recursive: true, force: true });
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
