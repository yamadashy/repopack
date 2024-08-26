export type RepopackOutputStyle = 'plain' | 'xml';

interface RepopackConfigBase {
  output?: {
    filePath?: string;
    style?: RepopackOutputStyle;
    headerText?: string;
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
}

export type RepopackConfigDefault = RepopackConfigBase & {
  output: {
    filePath: string;
    style: RepopackOutputStyle;
    headerText?: string;
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
};

export type RepopackConfigFile = RepopackConfigBase;

export type RepopackConfigCli = RepopackConfigBase;

export type RepopackConfigMerged = RepopackConfigDefault &
  RepopackConfigFile &
  RepopackConfigCli & {
    cwd: string;
  };
