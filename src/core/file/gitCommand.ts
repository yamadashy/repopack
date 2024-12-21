import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { logger } from '../../shared/logger.js';

const execAsync = promisify(exec);

export const isGitInstalled = async (
  deps = {
    execAsync,
  },
) => {
  try {
    const result = await deps.execAsync('git --version');
    return !result.stderr;
  } catch (error) {
    logger.trace('Git is not installed:', (error as Error).message);
    return false;
  }
};

export const execGitShallowClone = async (
  url: string,
  directory: string,
  branch?: string,
  deps = {
    execAsync,
  },
) => {
  if (branch) {
    await deps.execAsync(`git -C ${directory} init`);
    await deps.execAsync(`git -C ${directory} remote add origin ${url}`);
    await deps.execAsync(`git -C ${directory} fetch --depth 1 origin ${branch}`);
    await deps.execAsync(`git -C ${directory} checkout FETCH_HEAD`);
    await deps.execAsync(`rm -rf ${directory}/.git 2>/dev/null || rmdir /s /q ${directory}\\.git`);
  } else {
    await deps.execAsync(`git clone --depth 1 ${url} ${directory}`);
  }
};
