export type RepomixOutputStyle = 'plain' | 'xml' | 'markdown';

interface RepomixConfigBase {
  output?: {
    filePath?: string;
    style?: RepomixOutputStyle;
    headerText?: string;
    instructionFilePath?: string;
    removeComments?: boolean;
    removeEmptyLines?: boolean;
    topFilesLength?: number;
    showLineNumbers?: boolean;
    copyToClipboard?: boolean;
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

export type RepomixConfigDefault = RepomixConfigBase & {
  output: {
    filePath: string;
    style: RepomixOutputStyle;
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

export type RepomixConfigFile = RepomixConfigBase;

export type RepomixConfigCli = RepomixConfigBase;

export type RepomixConfigMerged = RepomixConfigDefault &
  RepomixConfigFile &
  RepomixConfigCli & {
    cwd: string;
  };
