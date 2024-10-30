import os from 'node:os';

export const getProcessConcurrency = () => {
  const cpuCount = typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length || 1;

  // Use all available CPUs except one
  return Math.max(1, cpuCount - 1);
};
