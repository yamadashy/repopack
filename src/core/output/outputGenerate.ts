import fs from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';
import type { RepomixConfigMerged } from '../../config/configSchema.js';
import { RepomixError } from '../../shared/errorHandle.js';
import { generateTreeString } from '../file/fileTreeGenerate.js';
import type { ProcessedFile } from '../file/fileTypes.js';
import type { OutputGeneratorContext } from './outputGeneratorTypes.js';
import {
  generateHeader,
  generateSummaryAdditionalInfo,
  generateSummaryFileFormat,
  generateSummaryNotes,
  generateSummaryPurpose,
  generateSummaryUsageGuidelines,
} from './outputStyleDecorate.js';
import { getMarkdownTemplate } from './outputStyles/markdownStyle.js';
import { getPlainTemplate } from './outputStyles/plainStyle.js';
import { getXmlTemplate } from './outputStyles/xmlStyle.js';

const createRenderContext = (outputGeneratorContext: OutputGeneratorContext) => {
  return {
    generationHeader: generateHeader(outputGeneratorContext.generationDate),
    summaryPurpose: generateSummaryPurpose(),
    summaryFileFormat: generateSummaryFileFormat(),
    summaryUsageGuidelines: generateSummaryUsageGuidelines(
      outputGeneratorContext.config,
      outputGeneratorContext.instruction,
    ),
    summaryNotes: generateSummaryNotes(outputGeneratorContext.config),
    summaryAdditionalInfo: generateSummaryAdditionalInfo(),
    headerText: outputGeneratorContext.config.output.headerText,
    instruction: outputGeneratorContext.instruction,
    treeString: outputGeneratorContext.treeString,
    processedFiles: outputGeneratorContext.processedFiles,
  };
};

export const generateOutput = async (
  rootDir: string,
  config: RepomixConfigMerged,
  processedFiles: ProcessedFile[],
  allFilePaths: string[],
): Promise<string> => {
  const outputGeneratorContext = await buildOutputGeneratorContext(rootDir, config, allFilePaths, processedFiles);
  const renderContext = createRenderContext(outputGeneratorContext);

  let template: string;
  switch (config.output.style) {
    case 'xml':
      template = getXmlTemplate();
      break;
    case 'markdown':
      template = getMarkdownTemplate();
      break;
    default:
      template = getPlainTemplate();
  }

  const compiledTemplate = Handlebars.compile(template);
  return `${compiledTemplate(renderContext).trim()}\n`;
};

export const buildOutputGeneratorContext = async (
  rootDir: string,
  config: RepomixConfigMerged,
  allFilePaths: string[],
  processedFiles: ProcessedFile[],
): Promise<OutputGeneratorContext> => {
  let repositoryInstruction = '';

  if (config.output.instructionFilePath) {
    const instructionPath = path.resolve(rootDir, config.output.instructionFilePath);
    try {
      repositoryInstruction = await fs.readFile(instructionPath, 'utf-8');
    } catch {
      throw new RepomixError(`Instruction file not found at ${instructionPath}`);
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
