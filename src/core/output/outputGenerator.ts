import fs from 'node:fs/promises';
import path from 'node:path';
import type { RepopackConfigMerged } from '../../config/configTypes.js';
import { RepopackError } from '../../shared/errorHandler.js';
import { generateTreeString } from '../file/fileTreeGenerator.js';
import type { ProcessedFile } from '../file/fileTypes.js';
import type { OutputGeneratorContext } from './outputGeneratorTypes.js';
import { generateMarkdownStyle } from './styleGenerators/markdownStyleGenerator.js';
import { generatePlainStyle } from './styleGenerators/plainStyleGenerator.js';
import { generateXmlStyle } from './styleGenerators/xmlStyleGenerator.js';
import { splitOutput, type OutputSplit } from './outputSplitter.js';

export const generateOutput = async (
  rootDir: string,
  config: RepopackConfigMerged,
  processedFiles: ProcessedFile[],
  allFilePaths: string[],
): Promise<string[]> => {
  const maxTokensPerFile = config.output.maxTokensPerFile ?? Infinity; // Use Infinity if no limit is set

  const outputSplits: OutputSplit[] =
    maxTokensPerFile < Infinity
      ? splitOutput(
          processedFiles,
          maxTokensPerFile
        )
      : [{ partNumber: 1, tokenCount: 0, includedFiles: processedFiles }];

  const outputs = await Promise.all(
    outputSplits.map(async (outputSplit) => {
      const outputGeneratorContext = await buildOutputGeneratorContext(
        rootDir,
        config,
        outputSplit.includedFiles,  
        config.output.onlyShowPartFilesInRepoStructure ? outputSplit.includedFiles.map(f => f.path) : allFilePaths,
        processedFiles.length,
        outputSplits.length,
        outputSplit.partNumber,
      )

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
    }),
  );

  return outputs;
};

export const buildOutputGeneratorContext = async (
  rootDir: string,
  config: RepopackConfigMerged,
  includedFiles: ProcessedFile[] = [], // Add includedFiles parameter
  repositoryStructure: string[] = [],
  totalFiles: number = 1,
  totalParts: number = 1,
  partNumber: number = 1
): Promise<OutputGeneratorContext> => {
  let repositoryInstruction = '';

  if (config.output.instructionFilePath) {
    const instructionPath = path.resolve(
      rootDir,
      config.output.instructionFilePath,
    );
    try {
      repositoryInstruction = await fs.readFile(instructionPath, 'utf-8');
    } catch {
      throw new RepopackError(
        `Instruction file not found at ${instructionPath}`,
      );
    }
  }

  return {
    generationDate: new Date().toISOString(),
    treeString: generateTreeString(repositoryStructure), // Use includedFiles for treeString
    config,
    instruction: repositoryInstruction,
    content: '',
    includedFiles, 
    totalFiles,
    totalParts,
    partNumber
  };
};
