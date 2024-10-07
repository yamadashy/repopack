import { describe, expect, test } from 'vitest';
import { RepopackConfigValidationError, validateConfig } from '../../src/config/configValidate.js';

describe('configValidate', () => {
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

  test('should pass for a valid config with output style', () => {
    const validConfig = {
      output: { filePath: 'test.txt', style: 'xml' },
      ignore: { useDefaultPatterns: true },
    };
    expect(() => validateConfig(validConfig)).not.toThrow();
  });

  test('should throw for invalid output.style type', () => {
    const invalidConfig = { output: { style: 123 } };
    expect(() => validateConfig(invalidConfig)).toThrow(RepopackConfigValidationError);
    expect(() => validateConfig(invalidConfig)).toThrow('output.style must be a string');
  });

  test('should throw for invalid output.style value', () => {
    const invalidConfig = { output: { style: 'invalid' } };
    expect(() => validateConfig(invalidConfig)).toThrow(RepopackConfigValidationError);
    expect(() => validateConfig(invalidConfig)).toThrow('output.style must be either "plain" or "xml"');
  });
});
