import path from 'path';
import { RepopackConfig } from '../types/index.js';
import { defaultConfig } from './defaultConfig.js';
import { logger } from '../utils/logger.js';
import * as fs from 'fs/promises';

const defaultConfigPath = 'repopack.config.js';

export async function loadConfig(configPath: string | null): Promise<Partial<RepopackConfig>> {
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
      throw new Error(`Config file not found at ${configPath}`);
    }
  }

  try {
    const config = await import(fullPath);
    return config.default || {};
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error loading config from ${configPath}: ${error.message}`);
    } else {
      throw new Error(`Error loading config from ${configPath}`);
    }
  }
}

export function mergeConfigs(fileConfig: Partial<RepopackConfig>, cliConfig: Partial<RepopackConfig>): RepopackConfig {
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
  };
}
