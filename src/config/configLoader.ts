import path from 'node:path';
import * as fs from 'node:fs/promises';
import { logger } from '../shared/logger.js';
import { RepopackError } from '../shared/errorHandler.js';
import { RepopackConfigCli, RepopackConfigFile, RepopackConfigMerged } from './configTypes.js';
import { defaultConfig } from './defaultConfig.js';
import { RepopackConfigValidationError, validateConfig } from './configValidator.js';
import { getGlobalDirectory } from './globalDirectory.js';

const defaultConfigPath = 'repopack.config.json';

const getGlobalConfigPath = () => {
  return path.join(getGlobalDirectory(), 'repopack.config.json');
};

export const loadFileConfig = async (rootDir: string, configPath: string | null): Promise<RepopackConfigFile> => {
  let useDefaultConfig = false;
  if (!configPath) {
    useDefaultConfig = true;
    configPath = defaultConfigPath;
  }

  const fullPath = path.resolve(rootDir, configPath);

  logger.trace('Loading local config from:', fullPath);

  // Check local file existence
  const isLocalFileExists = await fs
    .stat(fullPath)
    .then((stats) => stats.isFile())
    .catch(() => false);

  if (isLocalFileExists) {
    return await loadAndValidateConfig(fullPath);
  }

  if (useDefaultConfig) {
    // Try to load global config
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
  } else {
    throw new RepopackError(`Config file not found at ${configPath}`);
  }
};

const loadAndValidateConfig = async (filePath: string): Promise<RepopackConfigFile> => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const config = JSON.parse(fileContent);
    validateConfig(config);
    return config;
  } catch (error) {
    if (error instanceof RepopackConfigValidationError) {
      throw new RepopackError(`Invalid configuration in ${filePath}: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      throw new RepopackError(`Invalid JSON in config file ${filePath}: ${error.message}`);
    } else if (error instanceof Error) {
      throw new RepopackError(`Error loading config from ${filePath}: ${error.message}`);
    } else {
      throw new RepopackError(`Error loading config from ${filePath}`);
    }
  }
};

export const mergeConfigs = (
  cwd: string,
  fileConfig: RepopackConfigFile,
  cliConfig: RepopackConfigCli,
): RepopackConfigMerged => ({
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
});
