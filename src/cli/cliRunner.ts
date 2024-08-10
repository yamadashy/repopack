import path from 'node:path';
import process from 'node:process';
import { program, OptionValues } from 'commander';
import pc from 'picocolors';
import { PackResult, pack } from '../core/packager.js';
import {
  RepopackConfigCli,
  RepopackConfigFile,
  RepopackConfigMerged,
  RepopackOutputStyle,
} from '../config/configTypes.js';
import { loadFileConfig, mergeConfigs } from '../config/configLoader.js';
import { logger } from '../shared/logger.js';
import { getVersion } from '../core/file/packageJsonParser.js';
import { handleError } from '../shared/errorHandler.js';
import Spinner from './cliSpinner.js';
import { printSummary, printTopFiles, printCompletion, printSecurityCheck } from './cliPrinter.js';

interface CliOptions extends OptionValues {
  version?: boolean;
  output?: string;
  include?: string;
  ignore?: string;
  config?: string;
  verbose?: boolean;
  topFilesLen?: number;
  outputShowLineNumbers?: boolean;
  style?: RepopackOutputStyle;
}

export async function run() {
  try {
    const version = await getVersion();

    program
      .version(version)
      .description('Repopack - Pack your repository into a single AI-friendly file')
      .arguments('[directory]')
      .option('-v, --version', 'show version information')
      .option('-o, --output <file>', 'specify the output file name')
      .option('--include <patterns>', 'list of include patterns (comma-separated)')
      .option('-i, --ignore <patterns>', 'additional ignore patterns (comma-separated)')
      .option('-c, --config <path>', 'path to a custom config file')
      .option('--top-files-len <number>', 'specify the number of top files to display', parseInt)
      .option('--output-show-line-numbers', 'add line numbers to each line in the output')
      .option('--style <type>', 'specify the output style (plain or xml)')
      .option('--verbose', 'enable verbose logging for detailed output')
      .action((directory = '.', options: CliOptions) => executeAction(directory, process.cwd(), options));

    await program.parseAsync(process.argv);
  } catch (error) {
    handleError(error);
  }
}

const executeAction = async (directory: string, rootDir: string, options: CliOptions) => {
  const version = await getVersion();

  if (options.version) {
    console.log(version);
    return;
  }

  console.log(pc.dim(`\n📦 Repopack v${version}\n`));

  logger.setVerbose(options.verbose || false);
  logger.trace('Loaded CLI options:', options);

  // Load the config file
  const fileConfig: RepopackConfigFile = await loadFileConfig(rootDir, options.config ?? null);
  logger.trace('Loaded file config:', fileConfig);

  // Parse the CLI options
  const cliConfig: RepopackConfigCli = {};
  if (options.output) {
    cliConfig.output = { filePath: options.output };
  }
  if (options.include) {
    cliConfig.include = options.include.split(',');
  }
  if (options.ignore) {
    cliConfig.ignore = { customPatterns: options.ignore.split(',') };
  }
  if (options.topFilesLen !== undefined) {
    cliConfig.output = { ...cliConfig.output, topFilesLength: options.topFilesLen };
  }
  if (options.outputShowLineNumbers !== undefined) {
    cliConfig.output = { ...cliConfig.output, showLineNumbers: options.outputShowLineNumbers };
  }
  if (options.style) {
    cliConfig.output = { ...cliConfig.output, style: options.style.toLowerCase() as RepopackOutputStyle };
  }
  logger.trace('CLI config:', cliConfig);

  // Merge default, file, and CLI configs
  const config: RepopackConfigMerged = mergeConfigs(fileConfig, cliConfig);

  logger.trace('Merged config:', config);

  // Ensure the output file is always in the current working directory
  config.output.filePath = path.resolve(rootDir, path.basename(config.output.filePath));

  const targetPath = path.resolve(directory);

  const spinner = new Spinner('Packing files...');
  spinner.start();

  let packResult: PackResult;

  try {
    packResult = await pack(targetPath, config);
  } catch (error) {
    spinner.fail('Error during packing');
    throw error;
  }

  spinner.succeed('Packing completed successfully!');
  console.log('');

  if (config.output.topFilesLength > 0) {
    printTopFiles(packResult.fileCharCounts, packResult.fileTokenCounts, config.output.topFilesLength);
    console.log('');
  }

  printSecurityCheck(rootDir, packResult.suspiciousFilesResults);
  console.log('');

  printSummary(
    rootDir,
    packResult.totalFiles,
    packResult.totalCharacters,
    packResult.totalTokens,
    config.output.filePath,
    packResult.suspiciousFilesResults,
  );
  console.log('');

  printCompletion();
};
