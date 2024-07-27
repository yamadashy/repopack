import { RepopackConfigDefault } from '../types/index.js';

export const defaultConfig: RepopackConfigDefault = {
  output: {
    filePath: 'repopack-output.txt',
    removeComments: false,
    removeEmptyLines: false,
    topFilesLength: 5,
    showLineNumbers: false,
  },
  ignore: {
    useGitignore: true,
    useDefaultPatterns: true,
    customPatterns: [],
  },
};
