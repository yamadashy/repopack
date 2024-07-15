import { program } from 'commander';
import Spinner from '../utils/spinner.js';
import { pack } from '../core/packager.js';
import { RepopackConfig } from '../types/index.js';
import { loadConfig, mergeConfigs } from '../config/configLoader.js';
import { logger } from '../utils/logger.js';
import { getVersion } from '../utils/packageJsonUtils.js';
import { handleError, RepopackError } from '../utils/errorHandler.js';
import pc from 'picocolors';

export async function run() {
  try {
    await runInternal();
  } catch (error) {
    handleError(error);
  }
}

async function runInternal() {
  const version = await getVersion();

  console.log(pc.dim(`\n📦 Repopack v${version}\n`));

  program
    .version(version)
    .description('Repopack - Pack your repository into a single AI-friendly file')
    .option('-o, --output <file>', 'specify the output file name (default: repopack-output.txt)')
    .option('-i, --ignore <items>', 'comma-separated list of additional items to ignore')
    .option('-c, --config <path>', 'path to a custom config file (default: repopack.config.js)')
    .option('--no-default-ignore', 'disable the default ignore list')
    .option('-v, --verbose', 'enable verbose logging for detailed output')
    .addHelpText(
      'after',
      `
Example calls:
  $ repopack
  $ repopack -o custom-output.txt
  $ repopack -i "*.log,tmp" -v
  $ repopack -c ./custom-config.js

For more information, visit: https://github.com/yamadashy/repopack`,
    )
    .parse(process.argv);

  const options = program.opts();

  logger.setVerbose(options.verbose);

  logger.trace('Command line options:', options);

  const fileConfig = await loadConfig(options.config);

  logger.trace('Loaded file config:', fileConfig);

  const cliConfig: Partial<RepopackConfig> = {
    ...(options.output && { output: { filePath: options.output } }),
    ignore: {
      useDefaultPatterns: options.defaultIgnore !== false,
      customPatterns: options.ignore ? options.ignore.split(',') : undefined,
    },
  };

  logger.trace('CLI config:', cliConfig);

  const config = mergeConfigs(fileConfig, cliConfig);

  logger.trace('Merged config:', config);

  if (!config.output.filePath) {
    throw new RepopackError(
      'Output file is not specified. Please provide it in the config file or via command line option.',
    );
  }

  console.log('');

  const spinner = new Spinner('Packing files...');
  spinner.start();

  try {
    const { totalFiles, totalCharacters } = await pack(process.cwd(), config);

    spinner.succeed('Packing completed successfully!');

    console.log('');
    console.log(pc.white('📊 Pack Summary:'));
    console.log(pc.dim('────────────────'));
    console.log(`${pc.white('Total Files:')}  ${pc.white(totalFiles.toString())}`);
    console.log(`${pc.white('Total Chars:')}  ${pc.white(totalCharacters.toString())}`);
    console.log(`${pc.white('     Output:')}  ${pc.white(config.output.filePath)}`);

    console.log('');
    console.log(pc.green('🎉 All Done!'));
    console.log(pc.white('Your repository has been successfully packed.'));
  } catch (error) {
    spinner.fail('Error during packing');
    throw error;
  }
}
