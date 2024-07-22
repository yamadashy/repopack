import { RepopackConfigDefault } from '../types/index.js';

export const defaultConfig: RepopackConfigDefault = {
  output: {
    filePath: 'repopack-output.txt',
    removeComments: false,
    topFilesLength: 5,
  },
  ignore: {
    useDefaultPatterns: true,
    customPatterns: [],
  },
};
