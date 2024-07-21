import { RepopackConfigDefault } from '../types/index.js';

export const defaultConfig: RepopackConfigDefault = {
  output: {
    filePath: 'repopack-output.txt',
    removeComments: false,
  },
  ignore: {
    useDefaultPatterns: true,
    customPatterns: [],
  },
};
