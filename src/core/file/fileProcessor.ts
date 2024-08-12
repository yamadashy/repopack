import { RepopackConfigMerged } from '../../config/configTypes.js';
import { getFileManipulator } from './fileManipulater.js';
import { ProcessedFile, RawFile } from './fileTypes.js';

export const processFiles = (rawFiles: RawFile[], config: RepopackConfigMerged): ProcessedFile[] => {
  return rawFiles.map((rawFile) => ({
    path: rawFile.path,
    content: processContent(rawFile.content, rawFile.path, config),
  }));
};

export const processContent = (content: string, filePath: string, config: RepopackConfigMerged): string => {
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
