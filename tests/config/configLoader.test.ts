import { expect, test, describe } from 'vitest';
import { mergeConfigs } from '../../src/config/configLoader.js';
import { RepopackConfig } from '../../src/types/index.js';
import { defaultConfig } from '../../src/config/defaultConfig.js';

describe('configLoader', () => {
  test('mergeConfigs should correctly merge configs', () => {
    const fileConfig: Partial<RepopackConfig> = {
      output: {
        filePath: 'file-output.txt',
        headerText: 'File header',
      },
      ignore: {
        useDefaultPatterns: true,
        customPatterns: ['file-ignore'],
      },
    };

    const cliConfig: Partial<RepopackConfig> = {
      output: {
        filePath: 'cli-output.txt',
      },
      ignore: {
        useDefaultPatterns: true,
        customPatterns: ['cli-ignore'],
      },
    };

    const mergedConfig = mergeConfigs(fileConfig, cliConfig);

    expect(mergedConfig).toEqual({
      output: {
        filePath: 'cli-output.txt',
        headerText: 'File header',
      },
      ignore: {
        useDefaultPatterns: true,
        customPatterns: ['file-ignore', 'cli-ignore'],
      },
    });
  });

  test('mergeConfigs should use default values when not provided', () => {
    const mergedConfig = mergeConfigs({}, {});

    expect(mergedConfig).toEqual(defaultConfig);
  });

  test('mergeConfigs should override default headerText', () => {
    const fileConfig: Partial<RepopackConfig> = {
      output: {
        filePath: 'file-output.txt',
        headerText: 'Custom header',
      },
    };

    const mergedConfig = mergeConfigs(fileConfig, {});

    expect(mergedConfig.output.headerText).toBe('Custom header');
  });
});
