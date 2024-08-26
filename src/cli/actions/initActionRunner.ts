import fs from 'node:fs/promises';
import path from 'node:path';
import { cancel, confirm, group, intro, outro, select, text } from '@clack/prompts';
import pc from 'picocolors';
import type { RepopackConfigFile, RepopackOutputStyle } from '../../config/configTypes.js';
import { defaultConfig } from '../../config/defaultConfig.js';
import { getGlobalDirectory } from '../../config/globalDirectory.js';
import { logger } from '../../shared/logger.js';

export const runInitAction = async (rootDir: string, isGlobal: boolean): Promise<void> => {
  const configPath = isGlobal
    ? path.resolve(getGlobalDirectory(), 'repopack.config.json')
    : path.resolve(rootDir, 'repopack.config.json');

  try {
    // Check if the config file already exists
    await fs.access(configPath);
    const overwrite = await confirm({
      message: `A ${isGlobal ? 'global ' : ''}repopack.config.json file already exists. Do you want to overwrite it?`,
    });

    if (!overwrite) {
      logger.info('Configuration cancelled. Existing file will not be modified.');
      return;
    }
  } catch {
    // File doesn't exist, so we can proceed
  }

  intro(pc.bold(pc.cyan(`Welcome to Repopack ${isGlobal ? 'Global ' : ''}Configuration!`)));

  try {
    let isCancelled = false;

    const options = await group(
      {
        outputFilePath: () =>
          text({
            message: 'Output file path:',
            initialValue: defaultConfig.output.filePath,
            validate: (value) => (value.length === 0 ? 'Output file path is required' : undefined),
          }),

        outputStyle: () =>
          select({
            message: 'Output style:',
            options: [
              { value: 'plain', label: 'Plain', hint: 'Simple text format' },
              { value: 'xml', label: 'XML', hint: 'Structured XML format' },
            ],
            initialValue: defaultConfig.output.style,
          }),
      },
      {
        onCancel: () => {
          cancel('Configuration cancelled.');
          isCancelled = true;
        },
      },
    );

    if (isCancelled) {
      return;
    }

    const config: RepopackConfigFile = {
      ...defaultConfig,
      output: {
        ...defaultConfig.output,
        filePath: options.outputFilePath as string,
        style: options.outputStyle as RepopackOutputStyle,
      },
    };

    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    outro(
      `${pc.cyan(
        `Configuration complete! ${isGlobal ? 'Global ' : ''}repopack.config.json has been created at ${configPath}.\n`,
      )}You can now run ${pc.bold('repopack')} to pack your repository.\n\n${pc.yellow('Tip: ')}You can always edit repopack.config.json manually for more advanced configurations.`,
    );
  } catch (error) {
    logger.error(`Failed to create ${isGlobal ? 'global ' : ''}repopack.config.json:`, error);
  }
};
