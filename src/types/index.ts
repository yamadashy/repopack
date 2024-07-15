export interface RepopackConfig {
  output: {
    filePath: string;
    headerText?: string;
  };
  ignore: {
    useDefaultPatterns: boolean;
    customPatterns?: string[];
  };
}
