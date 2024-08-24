import pMap from 'p-map';
import { RepopackConfigMerged } from '../../config/configTypes.js';
import { getProcessConcurrency } from '../../shared/processConcurrency.js';
import { getFileManipulator } from './fileManipulator.js';
import { ProcessedFile, RawFile } from './fileTypes.js';

export const processFiles = async (rawFiles: RawFile[], config: RepopackConfigMerged): Promise<ProcessedFile[]> => {
  return pMap(
    rawFiles,
    async (rawFile) => ({
      path: rawFile.path,
      content: await processContent(rawFile.content, rawFile.path, config),
    }),
    {
      concurrency: getProcessConcurrency(),
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

  if (config.output.showLineNumbers) {
    const lines = processedContent.split('\n');
    const padding = lines.length.toString().length;
    const numberedLines = lines.map((line, index) => `${(index + 1).toString().padStart(padding)}: ${line}`);
    processedContent = numberedLines.join('\n');
  }

  return processedContent;
};
