interface RepopackConfigBase {
  output?: {
    filePath?: string;
    headerText?: string;
    removeComments?: boolean;
  };
  ignore?: {
    useDefaultPatterns?: boolean;
    customPatterns?: string[];
  };
}

export type RepopackConfigDefault = RepopackConfigBase & {
  output: {
    filePath: string;
    headerText?: string;
    removeComments?: boolean;
  };
  ignore: {
    useDefaultPatterns: boolean;
    customPatterns?: string[];
  };
};

export type RepopackConfigFile = RepopackConfigBase & {
  output?: {
    filePath?: string;
    headerText?: string;
    removeComments?: boolean;
  };
  ignore?: {
    useDefaultPatterns?: boolean;
    customPatterns?: string[];
  };
};

export type RepopackConfigCli = RepopackConfigBase & {
  output?: {
    filePath?: string;
    headerText?: string;
    removeComments?: boolean;
  };
  ignore?: {
    useDefaultPatterns?: boolean;
    customPatterns?: string[];
  };
};

export type RepopackConfigMerged = RepopackConfigDefault & RepopackConfigFile & RepopackConfigCli;
