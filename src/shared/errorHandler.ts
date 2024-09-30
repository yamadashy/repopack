import { z } from 'zod';
import { logger } from './logger.js';

export class RepopackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepopackError';
  }
}

export class RepopackConfigValidationError extends RepopackError {
  constructor(message: string) {
    super(message);
    this.name = 'RepopackConfigValidationError';
  }
}

export const handleError = (error: unknown): void => {
  if (error instanceof RepopackError) {
    logger.error(`Error: ${error.message}`);
  } else if (error instanceof Error) {
    logger.error(`Unexpected error: ${error.message}`);
    logger.debug('Stack trace:', error.stack);
  } else {
    logger.error('An unknown error occurred');
  }

  logger.info('For more help, please visit: https://github.com/yamadashy/repopack/issues');
};

export const rethrowValidationErrorIfZodError = (error: unknown, message: string): void => {
  if (error instanceof z.ZodError) {
    const zodErrorText = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new RepopackConfigValidationError(
      `${message}\n  ${zodErrorText}\n  Please check the config file and try again.`,
    );
  }
};
