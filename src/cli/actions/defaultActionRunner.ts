import path from 'node:path';
import { loadFileConfig, mergeConfigs } from '../../config/configLoader.js';
import {
  type RepopackConfigCli,
  type RepopackConfigFile,
  type RepopackConfigMerged,
  type RepopackOutputStyle,
  repopackConfigCliSchema,
} from '../../config/configSchema.js';
import { type PackResult, pack } from '../../core/packager.js';
import { rethrowValidationErrorIfZodError } from '../../shared/errorHandler.js';
import { logger } from '../../shared/logger.js';
import { printCompletion, printSecurityCheck, printSummary, printTopFiles } from '../cliPrinter.js';
import type { CliOptions } from '../cliRunner.js';
import Spinner from '../cliSpinner.js';

export interface DefaultActionRunnerResult {
  packResult: PackResult;
  config: RepopackConfigMerged;
}

export const runDefaultAction = async (
  directory: string,
  cwd: string,
  options: CliOptions,
): Promise<DefaultActionRunnerResult> => {
  logger.trace('Loaded CLI options:', options);

  // Load the config file
  const fileConfig: RepopackConfigFile = await loadFileConfig(cwd, options.config ?? null);
  logger.trace('Loaded file config:', fileConfig);

  // Parse the CLI options into a config
  const cliConfig: RepopackConfigCli = buildCliConfig(options);
  logger.trace('CLI config:', cliConfig);

  // Merge default, file, and CLI configs
  const config: RepopackConfigMerged = mergeConfigs(cwd, fileConfig, cliConfig);

  logger.trace('Merged config:', config);

  const targetPath = path.resolve(directory);

  const spinner = new Spinner('Packing files...');
  spinner.start();

  let packResult: PackResult;

  try {
    packResult = await pack(targetPath, config, (message) => {
      spinner.update(message);
    });
  } catch (error) {
    spinner.fail('Error during packing');
    throw error;
  }

  spinner.succeed('Packing completed successfully!');
  logger.log('');

  if (config.output.topFilesLength > 0) {
    printTopFiles(packResult.fileCharCounts, packResult.fileTokenCounts, config.output.topFilesLength);
    logger.log('');
  }

  printSecurityCheck(cwd, packResult.suspiciousFilesResults, config);
  logger.log('');

  printSummary(
    packResult.totalFiles,
    packResult.totalCharacters,
    packResult.totalTokens,
    config.output.filePath,
    packResult.suspiciousFilesResults,
    config,
  );
  logger.log('');

  printCompletion();

  return {
    packResult,
    config,
  };
};

const buildCliConfig = (options: CliOptions): RepopackConfigCli => {
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

  try {
    return repopackConfigCliSchema.parse(cliConfig);
  } catch (error) {
    rethrowValidationErrorIfZodError(error, 'Invalid cli arguments');
    throw error;
  }
};
