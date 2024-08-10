import * as fs from 'node:fs/promises';
import path from 'node:path';
import { RepopackConfigMerged } from '../../config/configTypes.js';
import { SanitizedFile } from '../file/fileSanitizer.js';
import { generateTreeString } from '../file/fileTreeGenerator.js';
import { generateXmlStyle } from './xmlStyleGenerator.js';
import { generatePlainStyle } from './plainStyleGenerator.js';
import { OutputGeneratorContext } from './outputGeneratorTypes.js';

export const generateOutput = async (
  rootDir: string,
  config: RepopackConfigMerged,
  sanitizedFiles: SanitizedFile[],
  allFilePaths: string[],
  fsModule = fs,
): Promise<void> => {
  const outputGeneratorContext = buildOutputGeneratorContext(config, allFilePaths, sanitizedFiles);

  let output: string;
  switch (config.output.style) {
    case 'xml':
      output = generateXmlStyle(outputGeneratorContext);
      break;
    default:
      output = generatePlainStyle(outputGeneratorContext);
  }

  const outputPath = path.resolve(rootDir, config.output.filePath);
  await fsModule.writeFile(outputPath, output);
};

export const buildOutputGeneratorContext = (
  config: RepopackConfigMerged,
  allFilePaths: string[],
  sanitizedFiles: SanitizedFile[],
): OutputGeneratorContext => ({
  generationDate: new Date().toISOString(),
  treeString: generateTreeString(allFilePaths),
  sanitizedFiles,
  config,
});
