import fs from 'node:fs/promises';
import path from 'node:path';
import { intro, outro, text, select, cancel, group } from '@clack/prompts';
import pc from 'picocolors';
import { logger } from '../../shared/logger.js';
import { RepopackConfigFile, RepopackOutputStyle } from '../../config/configTypes.js';
import { defaultConfig } from '../../config/defaultConfig.js';

export const runInitAction = async (rootDir: string): Promise<void> => {
  const configPath = path.resolve(rootDir, 'repopack.config.json');

  try {
    // Check if the config file already exists
    await fs.access(configPath);
    logger.warn('A repopack.config.json file already exists in this directory.');
    logger.warn('If you want to create a new one, please delete or rename the existing file first.');
    return;
  } catch {
    // File doesn't exist, so we can proceed
  }

  intro(pc.bold(pc.cyan('Welcome to Repopack!')));

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

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    outro(
      pc.cyan('Configuration complete! repopack.config.json has been created.\n') +
        'You can now run ' +
        pc.bold('repopack') +
        ' to pack your repository.\n\n' +
        pc.yellow('Tip: ') +
        'You can always edit repopack.config.json manually for more advanced configurations.',
    );
  } catch (error) {
    logger.error('Failed to create repopack.config.json:', error);
  }
};
