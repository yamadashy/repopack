import { logger } from './logger.js';

export class RepopackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepopackError';
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
