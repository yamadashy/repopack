import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getGlobalDirectory } from '../../src/config/globalDirectory.js';

vi.mock('node:os');

describe('getGlobalDirectory', () => {
  const originalPlatform = process.platform;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    process.env = originalEnv;
  });

  describe('Windows platform', () => {
    test('should use LOCALAPPDATA when available', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      process.env.LOCALAPPDATA = 'C:\\Users\\Test\\AppData\\Local';

      const result = getGlobalDirectory();
      expect(result).toBe(path.join('C:\\Users\\Test\\AppData\\Local', 'Repomix'));
    });

    test('should fall back to homedir when LOCALAPPDATA is not available', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      process.env.LOCALAPPDATA = undefined;
      vi.mocked(os.homedir).mockReturnValue('C:\\Users\\Test');

      const result = getGlobalDirectory();
      expect(result).toBe(path.join('C:\\Users\\Test', 'AppData', 'Local', 'Repomix'));
    });
  });

  describe('Unix platforms', () => {
    test('should use XDG_CONFIG_HOME when available', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      process.env.XDG_CONFIG_HOME = '/custom/config';

      const result = getGlobalDirectory();
      expect(result).toBe(path.join('/custom/config', 'repomix'));
    });

    test('should fall back to ~/.config on Linux', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      process.env.XDG_CONFIG_HOME = undefined;
      vi.mocked(os.homedir).mockReturnValue('/home/test');

      const result = getGlobalDirectory();
      expect(result).toBe(path.join('/home/test', '.config', 'repomix'));
    });

    test('should fall back to ~/.config on macOS', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      process.env.XDG_CONFIG_HOME = undefined;
      vi.mocked(os.homedir).mockReturnValue('/Users/test');

      const result = getGlobalDirectory();
      expect(result).toBe(path.join('/Users/test', '.config', 'repomix'));
    });
  });

  describe('Edge cases', () => {
    test('should handle empty homedir', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      process.env.XDG_CONFIG_HOME = undefined;
      vi.mocked(os.homedir).mockReturnValue('');

      const result = getGlobalDirectory();
      expect(result).toBe(path.join('', '.config', 'repomix'));
    });

    test('should handle unusual XDG_CONFIG_HOME paths', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      process.env.XDG_CONFIG_HOME = '////multiple///slashes///';

      const result = getGlobalDirectory();
      expect(result).toBe(path.join('////multiple///slashes///', 'repomix'));
    });
  });
});
