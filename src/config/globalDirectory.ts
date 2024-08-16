import os from 'node:os';
import path from 'node:path';

export const getGlobalDirectory = () => {
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return path.join(localAppData, 'Repopack');
  }

  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'repopack');
  }

  return path.join(os.homedir(), '.config', 'repopack');
};
