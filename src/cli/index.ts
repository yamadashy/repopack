import { program, OptionValues } from 'commander';
import path from 'path';
import { pack } from '../core/packager.js';
import { RepopackConfigCli, RepopackConfigFile, RepopackConfigMerged } from '../types/index.js';
import { loadFileConfig, mergeConfigs } from '../config/configLoader.js';
import { logger } from '../utils/logger.js';
import { getVersion } from '../utils/packageJsonUtils.js';
import Spinner from '../utils/spinner.js';
import pc from 'picocolors';
import { handleError } from '../utils/errorHandler.js';
import { printSummary, printTopFiles, printCompletion, printSecurityCheck } from './cliOutput.js';

interface CliOptions extends OptionValues {
  version?: boolean;
  output?: string;
  ignore?: string;
  config?: string;
  verbose?: boolean;
  topFilesLen?: number;
  outputShowLineNumbers?: boolean;
  include?: string[];
}

async function executeAction(directory: string, options: CliOptions) {
  const version = await getVersion();

  if (options.version) {
    console.log(version);
    return;
  }

  console.log(pc.dim(`\n📦 Repopack v${version}\n`));

  logger.setVerbose(options.verbose || false);
  logger.trace('Loaded CLI options:', options);

  const fileConfig: RepopackConfigFile = await loadFileConfig(options.config ?? null);
  logger.trace('Loaded file config:', fileConfig);

  const cliConfig: RepopackConfigCli = {};
  if (options.output) {
    cliConfig.output = { filePath: options.output };
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
  if (options.include) {
    cliConfig.include = options.include;
    // this line is never logged?
    logger.trace('Parsed include:', cliConfig.include);
  }
  logger.trace('CLI config:', cliConfig);

  const config: RepopackConfigMerged = mergeConfigs(fileConfig, cliConfig);

  logger.trace('Merged config:', config);

  // Ensure the output file is always in the current working directory
  config.output.filePath = path.resolve(process.cwd(), path.basename(config.output.filePath));

  const targetPath = path.resolve(directory);

  const spinner = new Spinner('Packing files...');
  spinner.start();

  try {
    const packResult = await pack(targetPath, config);
    spinner.succeed('Packing completed successfully!');
    console.log('');

    if (config.output.topFilesLength > 0) {
      printTopFiles(packResult.fileCharCounts, config.output.topFilesLength);
      console.log('');
    }

    printSecurityCheck(packResult.suspiciousFilesResults);
    console.log('');

    printSummary(
      packResult.totalFiles,
      packResult.totalCharacters,
      config.output.filePath,
      packResult.suspiciousFilesResults,
    );
    console.log('');

    printCompletion();
  } catch (error) {
    spinner.fail('Error during packing');
    throw error;
  }
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
      .option('-i, --ignore <patterns>', 'additional ignore patterns (comma-separated)')
      .option('-c, --config <path>', 'path to a custom config file')
      .option('--top-files-len <number>', 'specify the number of top files to display', parseInt)
      .option('--output-show-line-numbers', 'add line numbers to each line in the output')
      .option('--include <files...>', 'space-separated list of files to include')      
      .option('--verbose', 'enable verbose logging for detailed output')
      .action((directory = '.', options: CliOptions) => executeAction(directory, options));

    await program.parseAsync(process.argv);
    logger.trace('Parsed options:', program.opts())
  } catch (error) {
    handleError(error);
  }
}