import type { RepopackConfigMerged } from '../../config/configTypes.js';
import { generateTreeString } from '../file/fileTreeGenerator.js';
import type { ProcessedFile } from '../file/fileTypes.js';
import type { OutputGeneratorContext } from './outputGeneratorTypes.js';
import { generatePlainStyle } from './plainStyleGenerator.js';
import { generateXmlStyle } from './xmlStyleGenerator.js';

export const generateOutput = async (
  config: RepopackConfigMerged,
  processedFiles: ProcessedFile[],
  allFilePaths: string[],
): Promise<string> => {
  const outputGeneratorContext = buildOutputGeneratorContext(config, allFilePaths, processedFiles);

  let output: string;
  switch (config.output.style) {
    case 'xml':
      output = generateXmlStyle(outputGeneratorContext);
      break;
    default:
      output = generatePlainStyle(outputGeneratorContext);
  }

  return output;
};

export const buildOutputGeneratorContext = (
  config: RepopackConfigMerged,
  allFilePaths: string[],
  processedFiles: ProcessedFile[],
): OutputGeneratorContext => ({
  generationDate: new Date().toISOString(),
  treeString: generateTreeString(allFilePaths),
  processedFiles,
  config,
});
