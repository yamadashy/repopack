import os from 'node:os';

export const getProcessConcurrency = () => {
  const cpuCount = os.cpus().length;

  // Fallback for environments where os.cpus().length returns 0
  // see: https://github.com/yamadashy/repopack/issues/56
  if (cpuCount === 0) {
    return 1;
  }

  return cpuCount;
};
