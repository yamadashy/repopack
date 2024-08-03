import { RepopackConfigMerged } from '../../src/config/configTypes.js';
import { defaultConfig } from '../../src/config/defaultConfig.js';
import os from 'os';

export const createMockConfig = (config: Partial<RepopackConfigMerged> = {}): RepopackConfigMerged => {
  return {
    output: config.output || defaultConfig.output,
    ignore: config.ignore || defaultConfig.ignore,
    include: config.include || defaultConfig.include,
  };
};

export const isWindows = os.platform() === 'win32';
