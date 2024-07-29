interface RepopackConfigBase {
  output?: {
    filePath?: string;
    headerText?: string;
    removeComments?: boolean;
    removeEmptyLines?: boolean;
    topFilesLength?: number;
    showLineNumbers?: boolean;
  };
  ignore?: {
    useGitignore?: boolean;
    useDefaultPatterns?: boolean;
    customPatterns?: string[];
  };
  include?: string[];
}

export type RepopackConfigDefault = {
  output: {
    filePath: string;
    headerText?: string;
    removeComments: boolean;
    removeEmptyLines: boolean;
    topFilesLength: number;
    showLineNumbers: boolean;
  };
  ignore: {
    useGitignore: boolean;
    useDefaultPatterns: boolean;
    customPatterns: string[];
  };
  include: string[];
};

export type RepopackConfigFile = RepopackConfigBase & {
  output?: {
    filePath?: string;
    headerText?: string;
    removeComments?: boolean;
    removeEmptyLines?: boolean;
    topFilesLength?: number;
    showLineNumbers?: boolean;
  };
  ignore?: {
    useGitignore?: boolean;
    useDefaultPatterns?: boolean;
    customPatterns?: string[];
  };
  include?: string[];
};

export type RepopackConfigCli = RepopackConfigBase & {
  output?: {
    filePath?: string;
    headerText?: string;
    removeComments?: boolean;
    removeEmptyLines?: boolean;
    topFilesLength?: number;
    showLineNumbers?: boolean;
  };
  ignore?: {
    useGitignore?: boolean;
    useDefaultPatterns?: boolean;
    customPatterns?: string[];
  };
  include?: string[];
};

export type RepopackConfigMerged = RepopackConfigDefault & RepopackConfigFile & RepopackConfigCli;