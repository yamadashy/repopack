import type { RepomixConfigDefault, RepomixOutputStyle } from './configTypes.js';

export const defaultFilePathMap: Record<RepomixOutputStyle, string> = {
  plain: 'repomix-output.txt',
  markdown: 'repomix-output.md',
  xml: 'repomix-output.xml',
};

export const defaultConfig: RepomixConfigDefault = {
  output: {
    filePath: defaultFilePathMap.plain,
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
};
