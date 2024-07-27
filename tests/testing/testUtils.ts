import { defaultConfig } from '../../src/config/defaultConfig.js';
import { RepopackConfigMerged } from '../../src/types/index.js';

export const createMockConfig = (config: Partial<RepopackConfigMerged> = {}): RepopackConfigMerged => {
  return {
    output: config.output || defaultConfig.output,
    ignore: config.ignore || defaultConfig.ignore,
  };
};
