// @ts-check

/** @type {import('repopack').RepopackConfig} */
const config = {
  output: {
    filePath: 'repopack-output.txt',
    headerText: `
This repository contains the source code for the Repopack tool.
Repopack is designed to pack repository contents into a single file,
making it easier for AI systems to analyze and process the codebase.

Key Features:
- Configurable ignore patterns
- Custom header text support
- Efficient file processing and packing

Please refer to the README.md file for more detailed information on usage and configuration.
`,
  },
  ignore: {
    useDefaultPatterns: true,
    customPatterns: [
      // Custom ignore patterns
    ],
  },
};

export default config;
