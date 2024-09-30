import { type RepopackConfigDefault, repopackConfigDefaultSchema } from './configSchema.js';

export const defaultConfig: RepopackConfigDefault = repopackConfigDefaultSchema.parse({
  output: {
    filePath: 'repopack-output.txt',
    style: 'plain',
    removeComments: false,
    removeEmptyLines: false,
    topFilesLength: 5,
    showLineNumbers: false,
  },
  include: [],
  ignore: {
    useGitignore: true,
    useDefaultPatterns: true,
    customPatterns: [],
  },
  security: {
    enableSecurityCheck: true,
  },
});
