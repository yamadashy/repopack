import fs from 'node:fs/promises';
import path from 'node:path';
import type { RepopackConfigMerged } from '../../config/configTypes.js';
import { RepopackError } from '../../shared/errorHandle.js';
import { generateTreeString } from '../file/fileTreeGenerate.js';
import type { ProcessedFile } from '../file/fileTypes.js';
import type { OutputGeneratorContext } from './outputGeneratorTypes.js';
import { generateMarkdownStyle } from './outputStyles/markdownStyle.js';
import { generatePlainStyle } from './outputStyles/plainStyle.js';
import { generateXmlStyle } from './outputStyles/xmlStyle.js';

export const generateOutput = async (
  rootDir: string,
  config: RepopackConfigMerged,
  processedFiles: ProcessedFile[],
  allFilePaths: string[],
): Promise<string> => {
  const outputGeneratorContext = await buildOutputGeneratorContext(rootDir, config, allFilePaths, processedFiles);

  let output: string;
  switch (config.output.style) {
    case 'xml':
      output = generateXmlStyle(outputGeneratorContext);
      break;
    case 'markdown':
      output = generateMarkdownStyle(outputGeneratorContext);
      break;
    default:
      output = generatePlainStyle(outputGeneratorContext);
  }

  return output;
};

export const buildOutputGeneratorContext = async (
  rootDir: string,
  config: RepopackConfigMerged,
  allFilePaths: string[],
  processedFiles: ProcessedFile[],
): Promise<OutputGeneratorContext> => {
  let repositoryInstruction = '';

  if (config.output.instructionFilePath) {
    const instructionPath = path.resolve(rootDir, config.output.instructionFilePath);
    try {
      repositoryInstruction = await fs.readFile(instructionPath, 'utf-8');
    } catch {
      throw new RepopackError(`Instruction file not found at ${instructionPath}`);
    }
  }

  return {
    generationDate: new Date().toISOString(),
    treeString: generateTreeString(allFilePaths),
    processedFiles,
    config,
    instruction: repositoryInstruction,
  };
};
