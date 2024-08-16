import os from 'node:os';
import path from 'node:path';
import { expect, describe, test, vi, beforeEach } from 'vitest';
import { getGlobalDirectory } from '../../src/config/globalDirectory.js';
import { isLinux, isMac, isWindows } from '../testing/testUtils.js';

vi.mock('node:os');

describe('globalDirectory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env = {};
  });

  test.runIf(isWindows)('should return correct path for Windows', () => {
    vi.mocked(os.platform).mockReturnValue('win32');
    vi.mocked(os.homedir).mockReturnValue('C:\\Users\\TestUser');
    process.env.LOCALAPPDATA = 'C:\\Users\\TestUser\\AppData\\Local';

    const result = getGlobalDirectory();
    expect(result).toBe(path.join('C:\\Users\\TestUser\\AppData\\Local', 'Repopack'));
  });

  test.runIf(isWindows)('should use homedir if LOCALAPPDATA is not set on Windows', () => {
    vi.mocked(os.platform).mockReturnValue('win32');
    vi.mocked(os.homedir).mockReturnValue('C:\\Users\\TestUser');
    delete process.env.LOCALAPPDATA;

    const result = getGlobalDirectory();
    expect(result).toBe(path.join('C:\\Users\\TestUser', 'AppData', 'Local', 'Repopack'));
  });

  test.runIf(isLinux)('should use XDG_CONFIG_HOME on Unix systems if set', () => {
    vi.mocked(os.platform).mockReturnValue('linux');
    process.env.XDG_CONFIG_HOME = '/custom/config';

    const result = getGlobalDirectory();
    expect(result).toBe(path.join('/custom/config', 'repopack'));
  });

  test.runIf(isMac)('should use ~/.config on Unix systems if XDG_CONFIG_HOME is not set', () => {
    vi.mocked(os.platform).mockReturnValue('darwin');
    vi.mocked(os.homedir).mockReturnValue('/Users/TestUser');
    delete process.env.XDG_CONFIG_HOME;

    const result = getGlobalDirectory();
    expect(result).toBe(path.join('/Users/TestUser', '.config', 'repopack'));
  });
});
