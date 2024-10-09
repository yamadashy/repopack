import type { RepopackConfigDefault, RepopackOutputStyle } from './configTypes.js';

export const defaultFilePathMap: Record<RepopackOutputStyle, string> = {
  plain: 'repopack-output.txt',
  markdown: 'repopack-output.md',
  xml: 'repopack-output.xml',
};

export const defaultConfig: RepopackConfigDefault = {
  output: {
    filePath: defaultFilePathMap.plain,
    style: 'plain',
    removeComments: false,
    removeEmptyLines: false,
    topFilesLength: 5,
    showLineNumbers: false,
    onlyShowPartFilesInRepoStructure: false
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
};
