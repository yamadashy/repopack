export type RepopackOutputStyle = 'plain' | 'xml' | 'markdown';

export interface RepopackOutputConfig {
  filePath?: string;
  style?: RepopackOutputStyle;
  headerText?: string;
  instructionFilePath?: string;
  removeComments?: boolean;
  removeEmptyLines?: boolean;
  topFilesLength?: number;
  showLineNumbers?: boolean;
  maxTokensPerFile?: number; // Added maxTokensPerFile
  onlyShowPartFilesInRepoStructure?: boolean;
}

interface RepopackConfigBase {
  output?: RepopackOutputConfig;
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
  output: RepopackOutputConfig;
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
