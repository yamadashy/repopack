import { getVersion } from '../../core/file/packageJsonParser.js';
import { logger } from '../../shared/logger.js';

export const runVersionAction = async (): Promise<void> => {
  const version = await getVersion();
  logger.log(version);
};
