import * as fs from 'node:fs/promises';
import { Stats } from 'node:fs';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { loadFileConfig, mergeConfigs } from '../../src/config/configLoader.js';
import { RepopackConfigFile, RepopackConfigCli } from '../../src/config/configTypes.js';

vi.mock('fs/promises');
vi.mock('../../src/utils/logger', () => ({
  logger: {
    trace: vi.fn(),
    note: vi.fn(),
  },
}));

describe('configLoader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('loadFileConfig', () => {
    test('should load and parse a valid config file', async () => {
      const mockConfig = {
        output: { filePath: 'test-output.txt' },
        ignore: { useDefaultPatterns: true },
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Stats);

      const result = await loadFileConfig(process.cwd(), 'test-config.json');
      expect(result).toEqual(mockConfig);
    });

    test('should return an empty object if no config file is found', async () => {
      vi.mocked(fs.stat).mockRejectedValue(new Error('File not found'));

      const result = await loadFileConfig(process.cwd(), null);
      expect(result).toEqual({});
    });

    test('should throw an error for invalid JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('invalid json');
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Stats);

      await expect(loadFileConfig(process.cwd(), 'test-config.json')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('mergeConfigs', () => {
    test('should correctly merge configs', () => {
      const fileConfig: RepopackConfigFile = {
        output: { filePath: 'file-output.txt' },
        ignore: { useDefaultPatterns: true, customPatterns: ['file-ignore'] },
      };
      const cliConfig: RepopackConfigCli = {
        output: { filePath: 'cli-output.txt' },
        ignore: { customPatterns: ['cli-ignore'] },
      };

      const result = mergeConfigs(fileConfig, cliConfig);

      expect(result.output.filePath).toBe('cli-output.txt');
      expect(result.ignore.useDefaultPatterns).toBe(true);
      expect(result.ignore.customPatterns).toContain('file-ignore');
      expect(result.ignore.customPatterns).toContain('cli-ignore');
    });
  });
});
