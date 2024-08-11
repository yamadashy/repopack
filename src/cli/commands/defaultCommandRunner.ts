import path from 'node:path';
import pc from 'picocolors';
import { PackResult, pack } from '../../core/packager.js';
import {
  RepopackConfigCli,
  RepopackConfigFile,
  RepopackConfigMerged,
  RepopackOutputStyle,
} from '../../config/configTypes.js';
import { loadFileConfig, mergeConfigs } from '../../config/configLoader.js';
import { logger } from '../../shared/logger.js';
import { CliOptions } from '../cliRunner.js';
import { getVersion } from '../../core/file/packageJsonParser.js';
import Spinner from './../cliSpinner.js';
import { printSummary, printTopFiles, printCompletion, printSecurityCheck } from './../cliPrinter.js';

export const runDefaultCommand = async (directory: string, cwd: string, options: CliOptions): Promise<void> => {
  const version = await getVersion();

  console.log(pc.dim(`\n📦 Repopack v${version}\n`));

  logger.setVerbose(options.verbose || false);
  logger.trace('Loaded CLI options:', options);

  // Load the config file
  const fileConfig: RepopackConfigFile = await loadFileConfig(cwd, options.config ?? null);
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
  config.output.filePath = path.resolve(cwd, path.basename(config.output.filePath));

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

  printSecurityCheck(cwd, packResult.suspiciousFilesResults);
  console.log('');

  printSummary(
    cwd,
    packResult.totalFiles,
    packResult.totalCharacters,
    packResult.totalTokens,
    config.output.filePath,
    packResult.suspiciousFilesResults,
  );
  console.log('');

  printCompletion();
};
