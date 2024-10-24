import * as fs from 'node:fs/promises';
import path from 'node:path';
import { RepopackError } from '../shared/errorHandle.js';
import { logger } from '../shared/logger.js';
import type { RepopackConfigCli, RepopackConfigFile, RepopackConfigMerged } from './configTypes.js';
import { RepopackConfigValidationError, validateConfig } from './configValidate.js';
import { defaultConfig, defaultFilePathMap } from './defaultConfig.js';
import { getGlobalDirectory } from './globalDirectory.js';

const defaultConfigPath = 'repopack.config.json';

const getGlobalConfigPath = () => {
  return path.join(getGlobalDirectory(), 'repopack.config.json');
};

export const loadFileConfig = async (rootDir: string, argConfigPath: string | null): Promise<RepopackConfigFile> => {
  let configPath = argConfigPath ?? defaultConfigPath;

  const fullPath = path.resolve(rootDir, configPath);
  logger.trace('Loading local config from:', fullPath);

  const [isLocalFileExists, isGlobalFileExists] = await Promise.all([
    checkFileExists(fullPath),
    checkFileExists(getGlobalConfigPath()),
  ]);

  if (isLocalFileExists) {
    return await loadAndValidateConfig(fullPath);
  }

  if (isGlobalFileExists) {
    return await loadAndValidateConfig(getGlobalConfigPath());
  }

  logger.note(
    `No custom config found at ${configPath} or global config. You can add a config file for additional settings. Please check https://github.com/yamadashy/repopack for more information.`,
  );
  return {};
};

const checkFileExists = async (filePath: string): Promise<boolean> => {
  return fs
    .stat(filePath)
    .then((stats) => stats.isFile())
    .catch(() => false);
};

const loadAndValidateConfig = async (filePath: string): Promise<RepopackConfigFile> => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const config = JSON.parse(fileContent);
    validateConfig(config);
    return config;
  } catch (error) {
    handleError(error, filePath);
  }
};

const handleError = (error: unknown, filePath: string): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new RepopackError(`Error loading config from ${filePath}: ${errorMessage}`);
};

const mergeConfigs = (
  cwd: string,
  fileConfig: RepopackConfigFile,
  cliConfig: RepopackConfigCli,
): RepopackConfigMerged => {
  const output = mergeOutput(fileConfig.output, cliConfig.output);
  const ignore = mergeIgnore(fileConfig.ignore, cliConfig.ignore);
  const include = Array.prototype.flat([defaultConfig.include || [], fileConfig.include || [], cliConfig.include || []]);

  return {
    cwd,
    output,
    ignore,
    include,
    security: {
      ...defaultConfig.security,
      ...fileConfig.security,
      ...cliConfig.security,
    },
  };
};

const mergeOutput = (fileOutput: any, cliOutput: any) => {
  const style = cliOutput?.style || fileOutput?.style || defaultConfig.output.style;
  const filePath = cliOutput?.filePath ?? fileOutput?.filePath ?? defaultFilePathMap[style];

  return {
    ...defaultConfig.output,
    ...fileOutput,
    ...cliOutput,
    filePath,
  };
};

const mergeIgnore = (fileIgnore: any, cliIgnore: any) => {
  return {
    ...defaultConfig.ignore,
    ...fileIgnore,
    ...cliIgnore,
    customPatterns: [
      ...(defaultConfig.ignore.customPatterns || []),
      ...(fileIgnore?.customPatterns || []),
      ...(cliIgnore?.customPatterns || []),
    ],
  };
};
