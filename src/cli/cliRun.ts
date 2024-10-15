import process from 'node:process';
import { type OptionValues, program } from 'commander';
import pc from 'picocolors';
import type { RepopackOutputStyle } from '../config/configTypes.js';
import { getVersion } from '../core/file/packageJsonParse.js';
import { handleError } from '../shared/errorHandle.js';
import { logger } from '../shared/logger.js';
import { runDefaultAction } from './actions/defaultAction.js';
import { runInitAction } from './actions/initAction.js';
import { runRemoteAction } from './actions/remoteAction.js';
import { runVersionAction } from './actions/versionAction.js';

export interface CliOptions extends OptionValues {
  version?: boolean;
  output?: string;
  include?: string;
  ignore?: string;
  config?: string;
  verbose?: boolean;
  topFilesLen?: number;
  outputShowLineNumbers?: boolean;
  style?: RepopackOutputStyle;
  init?: boolean;
  global?: boolean;
  remote?: string;
  maxTokens?: number; // Add the maxTokens option
}

export async function run() {
  try {
    const version = await getVersion();

    program
      .description('Repopack - Pack your repository into a single AI-friendly file')
      .arguments('[directory]')
      .option('-v, --version', 'show version information')
      .option('-o, --output <file>', 'specify the output file name')
      .option('--include <patterns>', 'list of include patterns (comma-separated)')
      .option('-i, --ignore <patterns>', 'additional ignore patterns (comma-separated)')
      .option('-c, --config <path>', 'path to a custom config file')
      .option('--top-files-len <number>', 'specify the number of top files to display', Number.parseInt)
      .option('--output-show-line-numbers', 'add line numbers to each line in the output')
      .option('--style <type>', 'specify the output style (plain, xml, markdown)')
      .option('--verbose', 'enable verbose logging for detailed output')
      .option('--init', 'initialize a new repopack.config.json file')
      .option('--global', 'use global configuration (only applicable with --init)')
      .option('--remote <url>', 'process a remote Git repository')
      .option('--max-tokens <number>', 'maximum number of tokens per output file', Number.parseInt) // Add the maxTokens option
      .action((directory = '.', options: CliOptions = {}) => executeAction(directory, process.cwd(), options));

    await program.parseAsync(process.argv);
  } catch (error) {
    handleError(error);
  }
}

const executeAction = async (directory: string, cwd: string, options: CliOptions) => {
  logger.setVerbose(options.verbose || false);

  if (options.version) {
    await runVersionAction();
    return;
  }

  const version = await getVersion();
  logger.log(pc.dim(`\n📦 Repopack v${version}\n`));

  if (options.init) {
    await runInitAction(cwd, options.global || false);
    return;
  }

  if (options.remote) {
    await runRemoteAction(options.remote, options);
    return;
  }

  await runDefaultAction(directory, cwd, options);
};
