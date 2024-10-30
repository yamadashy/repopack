import { logger } from './logger.js';

export class RepomixError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepomixError';
  }
}

export const handleError = (error: unknown): void => {
  if (error instanceof RepomixError) {
    logger.error(`Error: ${error.message}`);
  } else if (error instanceof Error) {
    logger.error(`Unexpected error: ${error.message}`);
    logger.debug('Stack trace:', error.stack);
  } else {
    logger.error('An unknown error occurred');
  }

  logger.info('For more help, please visit: https://github.com/yamadashy/repomix/issues');
};
