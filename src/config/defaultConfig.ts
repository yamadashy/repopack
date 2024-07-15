import { RepopackConfig } from '../types/index.js';

export const defaultConfig: RepopackConfig = {
  output: {
    filePath: 'repopack-output.txt',
  },
  ignore: {
    useDefaultPatterns: true,
    customPatterns: [],
  },
};
