import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatGitUrl } from '../../../src/cli/actions/remoteActionRunner.js';

vi.mock('node:fs/promises');
vi.mock('node:child_process');
vi.mock('../../../src/cli/actions/defaultActionRunner.js');
vi.mock('../../../src/shared/logger.js');

describe('remoteActionRunner', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatGitUrl', () => {
    it('should format GitHub shorthand correctly', () => {
      expect(formatGitUrl('user/repo')).toBe('https://github.com/user/repo.git');
      expect(formatGitUrl('user-name/repo-name')).toBe('https://github.com/user-name/repo-name.git');
      expect(formatGitUrl('user_name/repo_name')).toBe('https://github.com/user_name/repo_name.git');
    });

    it('should add .git to HTTPS URLs if missing', () => {
      expect(formatGitUrl('https://github.com/user/repo')).toBe('https://github.com/user/repo.git');
    });

    it('should not modify URLs that are already correctly formatted', () => {
      expect(formatGitUrl('https://github.com/user/repo.git')).toBe('https://github.com/user/repo.git');
      expect(formatGitUrl('git@github.com:user/repo.git')).toBe('git@github.com:user/repo.git');
    });

    it('should not modify SSH URLs', () => {
      expect(formatGitUrl('git@github.com:user/repo.git')).toBe('git@github.com:user/repo.git');
    });

    it('should not modify URLs from other Git hosting services', () => {
      expect(formatGitUrl('https://gitlab.com/user/repo.git')).toBe('https://gitlab.com/user/repo.git');
      expect(formatGitUrl('https://bitbucket.org/user/repo.git')).toBe('https://bitbucket.org/user/repo.git');
    });
  });
});
