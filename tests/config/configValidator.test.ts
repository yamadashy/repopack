import { expect, test, describe } from 'vitest';
import { validateConfig, RepopackConfigValidationError } from '../../src/config/configValidator.js';

describe('configValidator', () => {
  test('should pass for a valid config', () => {
    const validConfig = {
      output: { filePath: 'test.txt', headerText: 'Test Header' },
      ignore: { useDefaultPatterns: true, customPatterns: ['*.log'] },
    };
    expect(() => validateConfig(validConfig)).not.toThrow();
  });

  test('should throw for non-object config', () => {
    expect(() => validateConfig('not an object')).toThrow(RepopackConfigValidationError);
  });

  test('should throw for invalid output.filePath', () => {
    const invalidConfig = { output: { filePath: 123 } };
    expect(() => validateConfig(invalidConfig)).toThrow(RepopackConfigValidationError);
  });

  test('should throw for invalid ignore.useDefaultPatterns', () => {
    const invalidConfig = { ignore: { useDefaultPatterns: 'true' } };
    expect(() => validateConfig(invalidConfig)).toThrow(RepopackConfigValidationError);
  });

  test('should throw for invalid ignore.customPatterns', () => {
    const invalidConfig = { ignore: { customPatterns: 'not an array' } };
    expect(() => validateConfig(invalidConfig)).toThrow(RepopackConfigValidationError);
  });
});
