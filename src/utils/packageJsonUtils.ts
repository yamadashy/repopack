import path from 'node:path';
import * as fs from 'node:fs/promises';
import * as url from 'node:url';

export const getVersion = async (): Promise<string> => {
  try {
    const packageJson = await getPackageJson();
    return packageJson.version;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return 'unknown';
  }
};

const getPackageJson = async (): Promise<{
  name: string;
  version: string;
}> => {
  const dirName = url.fileURLToPath(new URL('.', import.meta.url));
  const packageJsonPath = path.join(dirName, '..', '..', 'package.json');
  const packageJsonFile = await fs.readFile(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonFile);
  return packageJson;
};
