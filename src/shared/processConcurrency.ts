import os from 'node:os';

export const getProcessConcurrency = () => {
  const cpuCount = os.availableParallelism();

  // Use all available CPUs except one
  return Math.max(1, cpuCount - 1);
};
