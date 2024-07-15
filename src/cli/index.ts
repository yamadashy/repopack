import { program, OptionValues } from 'commander';
import path from 'path';
import { pack } from '../core/packager.js';
import { RepopackConfigCli, RepopackConfigFile, RepopackConfigMerged } from '../types/index.js';
import { loadFileConfig, mergeConfigs } from '../config/configLoader.js';
import { logger } from '../utils/logger.js';
import { getVersion } from '../utils/packageJsonUtils.js';
import Spinner from '../utils/spinner.js';
import pc from 'picocolors';
import { handleError } from '../utils/errorHandler.js';

interface CliOptions extends OptionValues {
  output?: string;
  ignore?: string;
  config?: string;
  verbose?: boolean;
}

async function executeAction(directory: string, options: CliOptions) {
  logger.setVerbose(options.verbose || false);

  const fileConfig: RepopackConfigFile = await loadFileConfig(options.config ?? null);
  logger.trace('Loaded file config:', fileConfig);

  const cliConfig: RepopackConfigCli = {};
  if (options.output) {
    cliConfig.output = { filePath: options.output };
  }
  if (options.ignore) {
    cliConfig.ignore = { customPatterns: options.ignore.split(',') };
  }
  logger.trace('CLI config:', cliConfig);

  const config: RepopackConfigMerged = mergeConfigs(fileConfig, cliConfig);

  logger.trace('Merged config:', config);

  // Ensure the output file is always in the current working directory
  config.output.filePath = path.resolve(process.cwd(), path.basename(config.output.filePath));

  const targetPath = path.resolve(directory);

  const spinner = new Spinner('Packing files...');
  spinner.start();

  try {
    const { totalFiles, totalCharacters } = await pack(targetPath, config);
    spinner.succeed('Packing completed successfully!');

    console.log('');
    console.log(pc.white('📊 Pack Summary:'));
    console.log(pc.dim('────────────────'));
    console.log(`${pc.white('Total Files:')} ${pc.white(totalFiles.toString())}`);
    console.log(`${pc.white('Total Chars:')} ${pc.white(totalCharacters.toString())}`);
    console.log(`${pc.white('     Output:')} ${pc.white(config.output.filePath)}`);

    console.log('');
    console.log(pc.green('🎉 All Done!'));
    console.log(pc.white('Your repository has been successfully packed.'));
  } catch (error) {
    spinner.fail('Error during packing');
    throw error;
  }
}

export async function run() {
  try {
    const version = await getVersion();

    console.log(pc.dim(`\n📦 Repopack v${version}\n`));

    program
      .version(version)
      .description('Repopack - Pack your repository into a single AI-friendly file')
      .arguments('[directory]')
      .option('-o, --output <file>', 'specify the output file name')
      .option('-i, --ignore <patterns>', 'additional ignore patterns (comma-separated)')
      .option('-c, --config <path>', 'path to a custom config file')
      .option('-v, --verbose', 'enable verbose logging for detailed output')
      .action((directory = '.', options: CliOptions) => executeAction(directory, options));

    await program.parseAsync(process.argv);
  } catch (error) {
    handleError(error);
  }
}
