import os from 'node:os';

export const getProcessConcurrency = () => {
  const cpuCount = os.cpus().length;

  // Fallback for environments where os.cpus().length returns 0
  // see: https://github.com/yamadashy/repopack/issues/56
  if (cpuCount === 0) {
    return 1;
  }

  // Use all available CPUs except one
  return Math.max(1, cpuCount - 1);
};
