import { RepomixError } from '../shared/errorHandle.js';
import type { RepomixConfigFile } from './configTypes.js';

export class RepomixConfigValidationError extends RepomixError {
  constructor(message: string) {
    super(message);
    this.name = 'RepomixConfigValidationError';
  }
}

export function validateConfig(config: unknown): asserts config is RepomixConfigFile {
  if (typeof config !== 'object' || config == null) {
    throw new RepomixConfigValidationError('Configuration must be an object');
  }

  const { output, ignore, security } = config as Partial<RepomixConfigFile>;

  // Validate output
  if (output !== undefined) {
    if (typeof output !== 'object' || output == null) {
      throw new RepomixConfigValidationError('output must be an object');
    }

    const { filePath, headerText, style } = output;
    if (filePath !== undefined && typeof filePath !== 'string') {
      throw new RepomixConfigValidationError('output.filePath must be a string');
    }
    if (headerText !== undefined && typeof headerText !== 'string') {
      throw new RepomixConfigValidationError('output.headerText must be a string');
    }
    if (style !== undefined) {
      if (typeof style !== 'string') {
        throw new RepomixConfigValidationError('output.style must be a string');
      }
      if (style !== 'plain' && style !== 'xml' && style !== 'markdown') {
        throw new RepomixConfigValidationError('output.style must be either "plain", "xml" or "markdown"');
      }
    }
  }

  // Validate ignore
  if (ignore !== undefined) {
    if (typeof ignore !== 'object' || ignore == null) {
      throw new RepomixConfigValidationError('ignore must be an object');
    }

    const { useDefaultPatterns, customPatterns } = ignore;
    if (useDefaultPatterns !== undefined && typeof useDefaultPatterns !== 'boolean') {
      throw new RepomixConfigValidationError('ignore.useDefaultPatterns must be a boolean');
    }
    if (customPatterns !== undefined) {
      if (!Array.isArray(customPatterns)) {
        throw new RepomixConfigValidationError('ignore.customPatterns must be an array');
      }
      if (!customPatterns.every((pattern) => typeof pattern === 'string')) {
        throw new RepomixConfigValidationError('All items in ignore.customPatterns must be strings');
      }
    }
  }

  // Validate security
  if (security !== undefined) {
    if (typeof security !== 'object' || security == null) {
      throw new RepomixConfigValidationError('security must be an object');
    }

    const { enableSecurityCheck } = security;
    if (enableSecurityCheck !== undefined && typeof enableSecurityCheck !== 'boolean') {
      throw new RepomixConfigValidationError('security.enableSecurityCheck must be a boolean');
    }
  }
}
