import os from 'node:os';
import pMap from 'p-map';
import { RepopackConfigMerged } from '../../config/configTypes.js';
import { getFileManipulator } from './fileManipulater.js';
import { ProcessedFile, RawFile } from './fileTypes.js';

export const processFiles = async (rawFiles: RawFile[], config: RepopackConfigMerged): Promise<ProcessedFile[]> => {
  return pMap(
    rawFiles,
    async (rawFile) => ({
      path: rawFile.path,
      content: await processContent(rawFile.content, rawFile.path, config),
    }),
    {
      concurrency: os.cpus().length,
    },
  );
};

export const processContent = async (
  content: string,
  filePath: string,
  config: RepopackConfigMerged,
): Promise<string> => {
  let processedContent = content;
  const manipulator = getFileManipulator(filePath);

  if (config.output.removeComments && manipulator) {
    processedContent = manipulator.removeComments(processedContent);
  }

  if (config.output.removeEmptyLines && manipulator) {
    processedContent = manipulator.removeEmptyLines(processedContent);
  }

  processedContent = processedContent.trim();

  return processedContent;
};
