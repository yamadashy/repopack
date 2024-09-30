import * as fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { RepopackError, rethrowValidationErrorIfZodError } from '../shared/errorHandler.js';
import { logger } from '../shared/logger.js';
import {
  type RepopackConfigCli,
  type RepopackConfigFile,
  type RepopackConfigMerged,
  repopackConfigFileSchema,
  repopackConfigMergedSchema,
} from './configSchema.js';
import { defaultConfig } from './defaultConfig.js';
import { getGlobalDirectory } from './globalDirectory.js';

const defaultConfigPath = 'repopack.config.json';

const getGlobalConfigPath = () => {
  return path.join(getGlobalDirectory(), 'repopack.config.json');
};

export const loadFileConfig = async (rootDir: string, argConfigPath: string | null): Promise<RepopackConfigFile> => {
  let useDefaultConfig = false;
  let configPath = argConfigPath;
  if (!configPath) {
    useDefaultConfig = true;
    configPath = defaultConfigPath;
  }

  const fullPath = path.resolve(rootDir, configPath);

  logger.trace('Loading local config from:', fullPath);

  const isLocalFileExists = await fs
    .stat(fullPath)
    .then((stats) => stats.isFile())
    .catch(() => false);

  if (isLocalFileExists) {
    return await loadAndValidateConfig(fullPath);
  }

  if (useDefaultConfig) {
    const globalConfigPath = getGlobalConfigPath();
    logger.trace('Loading global config from:', globalConfigPath);

    const isGlobalFileExists = await fs
      .stat(globalConfigPath)
      .then((stats) => stats.isFile())
      .catch(() => false);

    if (isGlobalFileExists) {
      return await loadAndValidateConfig(globalConfigPath);
    }

    logger.note(
      `No custom config found at ${configPath} or global config at ${globalConfigPath}.\nYou can add a config file for additional settings. Please check https://github.com/yamadashy/repopack for more information.`,
    );
    return {};
  }
  throw new RepopackError(`Config file not found at ${configPath}`);
};

const loadAndValidateConfig = async (filePath: string): Promise<RepopackConfigFile> => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const config = JSON.parse(fileContent);
    return repopackConfigFileSchema.parse(config);
  } catch (error) {
    rethrowValidationErrorIfZodError(error, 'Invalid config schema');
    if (error instanceof SyntaxError) {
      throw new RepopackError(`Invalid JSON in config file ${filePath}: ${error.message}`);
    }
    if (error instanceof Error) {
      throw new RepopackError(`Error loading config from ${filePath}: ${error.message}`);
    }
    throw new RepopackError(`Error loading config from ${filePath}`);
  }
};

export const mergeConfigs = (
  cwd: string,
  fileConfig: RepopackConfigFile,
  cliConfig: RepopackConfigCli,
): RepopackConfigMerged => {
  const mergedConfig = {
    cwd,
    output: {
      ...defaultConfig.output,
      ...fileConfig.output,
      ...cliConfig.output,
    },
    ignore: {
      ...defaultConfig.ignore,
      ...fileConfig.ignore,
      ...cliConfig.ignore,
      customPatterns: [
        ...(defaultConfig.ignore.customPatterns || []),
        ...(fileConfig.ignore?.customPatterns || []),
        ...(cliConfig.ignore?.customPatterns || []),
      ],
    },
    include: [...(defaultConfig.include || []), ...(fileConfig.include || []), ...(cliConfig.include || [])],
    security: {
      ...defaultConfig.security,
      ...fileConfig.security,
      ...cliConfig.security,
    },
  };

  try {
    return repopackConfigMergedSchema.parse(mergedConfig);
  } catch (error) {
    rethrowValidationErrorIfZodError(error, 'Invalid merged config');
    throw error;
  }
};
