import { getVersion } from '../../core/file/packageJsonParser.js';

export const runVersionCommand = async (): Promise<void> => {
  const version = await getVersion();
  console.log(version);
};
