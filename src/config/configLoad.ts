import * as fs from 'node:fs/promises';
import path from 'node:path';
import { RepomixError } from '../shared/errorHandle.js';
import { logger } from '../shared/logger.js';
import type { RepomixConfigCli, RepomixConfigFile, RepomixConfigMerged } from './configTypes.js';
import { RepomixConfigValidationError, validateConfig } from './configValidate.js';
import { defaultConfig, defaultFilePathMap } from './defaultConfig.js';
import { getGlobalDirectory } from './globalDirectory.js';

const defaultConfigPath = 'repomix.config.json';

const getGlobalConfigPath = () => {
  return path.join(getGlobalDirectory(), 'repomix.config.json');
};

export const loadFileConfig = async (rootDir: string, argConfigPath: string | null): Promise<RepomixConfigFile> => {
  let useDefaultConfig = false;
  let configPath = argConfigPath;
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
      `No custom config found at ${configPath} or global config at ${globalConfigPath}.\nYou can add a config file for additional settings. Please check https://github.com/yamadashy/repomix for more information.`,
    );
    return {};
  }
  throw new RepomixError(`Config file not found at ${configPath}`);
};

const loadAndValidateConfig = async (filePath: string): Promise<RepomixConfigFile> => {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const config = JSON.parse(fileContent);
    validateConfig(config);
    return config;
  } catch (error) {
    if (error instanceof RepomixConfigValidationError) {
      throw new RepomixError(`Invalid configuration in ${filePath}: ${error.message}`);
    }
    if (error instanceof SyntaxError) {
      throw new RepomixError(`Invalid JSON in config file ${filePath}: ${error.message}`);
    }
    if (error instanceof Error) {
      throw new RepomixError(`Error loading config from ${filePath}: ${error.message}`);
    }
    throw new RepomixError(`Error loading config from ${filePath}`);
  }
};

export const mergeConfigs = (
  cwd: string,
  fileConfig: RepomixConfigFile,
  cliConfig: RepomixConfigCli,
): RepomixConfigMerged => {
  // If the output file path is not provided in the config file or CLI, use the default file path for the style
  if (cliConfig.output?.filePath == null && fileConfig.output?.filePath == null) {
    const style = cliConfig.output?.style || fileConfig.output?.style || defaultConfig.output.style;
    defaultConfig.output.filePath = defaultFilePathMap[style];
  }

  return {
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
};
