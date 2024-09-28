export type RepopackOutputStyle = 'plain' | 'xml' | 'markdown';

interface RepopackConfigBase {
  output?: {
    filePath?: string;
    style?: RepopackOutputStyle;
    headerText?: string;
    instructionFilePath?: string;
    removeComments?: boolean;
    removeEmptyLines?: boolean;
    topFilesLength?: number;
    showLineNumbers?: boolean;
  };
  include?: string[];
  ignore?: {
    useGitignore?: boolean;
    useDefaultPatterns?: boolean;
    customPatterns?: string[];
  };
  security?: {
    enableSecurityCheck?: boolean;
  };
}

export type RepopackConfigDefault = RepopackConfigBase & {
  output: {
    filePath: string;
    style: RepopackOutputStyle;
    headerText?: string;
    instructionFilePath?: string;
    removeComments: boolean;
    removeEmptyLines: boolean;
    topFilesLength: number;
    showLineNumbers: boolean;
  };
  include: string[];
  ignore: {
    useGitignore: boolean;
    useDefaultPatterns: boolean;
    customPatterns?: string[];
  };
  security: {
    enableSecurityCheck: boolean;
  };
};

export type RepopackConfigFile = RepopackConfigBase;

export type RepopackConfigCli = RepopackConfigBase;

export type RepopackConfigMerged = RepopackConfigDefault &
  RepopackConfigFile &
  RepopackConfigCli & {
    cwd: string;
  };
