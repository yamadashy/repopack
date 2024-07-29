import path from 'path';
import { RepopackConfigCli as RepopackConfigCli, RepopackConfigFile, RepopackConfigMerged } from '../types/index.js';
import { defaultConfig } from './defaultConfig.js';
import { logger } from '../utils/logger.js';
import * as fs from 'fs/promises';
import { RepopackError } from '../utils/errorHandler.js';
import { RepopackConfigValidationError, validateConfig } from './configValidator.js';

const defaultConfigPath = 'repopack.config.json';

export async function loadFileConfig(configPath: string | null): Promise<RepopackConfigFile> {
  let useDefaultConfig = false;
  if (!configPath) {
    useDefaultConfig = true;
    configPath = defaultConfigPath;
  }

  const fullPath = path.resolve(process.cwd(), configPath);

  logger.trace('Loading config from:', fullPath);

  // Check file existence
  const isFileExists = await fs
    .stat(fullPath)
    .then((stats) => stats.isFile())
    .catch(() => false);
  if (!isFileExists) {
    if (useDefaultConfig) {
      logger.note(
        `No custom config found at ${configPath}.\nYou can add a config file for additional settings. Please check https://github.com/yamadashy/repopack for more information.`,
      );
      return {};
    } else {
      throw new RepopackError(`Config file not found at ${configPath}`);
    }
  }

  try {
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const config = JSON.parse(fileContent);
    validateConfig(config);
    return config;
  } catch (error) {
    if (error instanceof RepopackConfigValidationError) {
      throw new RepopackError(`Invalid configuration in ${configPath}: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      throw new RepopackError(`Invalid JSON in config file ${configPath}: ${error.message}`);
    } else if (error instanceof Error) {
      throw new RepopackError(`Error loading config from ${configPath}: ${error.message}`);
    } else {
      throw new RepopackError(`Error loading config from ${configPath}`);
    }
  }
}

export function mergeConfigs(fileConfig: RepopackConfigFile, cliConfig: RepopackConfigCli): RepopackConfigMerged {
  return {
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
    includeFiles: [
      ...(defaultConfig.includeFiles || []),
      ...(fileConfig.includeFiles || []),
      ...(cliConfig.includeFiles || []),  
    ],
  };
}