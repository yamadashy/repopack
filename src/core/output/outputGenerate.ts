import fs from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';
import type { RepopackConfigMerged, RepopackOutputStyle } from '../../config/configTypes.js';
import { RepopackError } from '../../shared/errorHandle.js';
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

const compiledTemplateCache: Record<
  RepopackOutputStyle,
  HandlebarsTemplateDelegate<ReturnType<typeof createRenderContext>> | null
> = {
  xml: null,
  markdown: null,
  plain: null,
};

export const generateOutput = async (
  rootDir: string,
  config: RepopackConfigMerged,
  processedFiles: ProcessedFile[],
  allFilePaths: string[],
): Promise<string> => {
  const outputGeneratorContext = await buildOutputGeneratorContext(rootDir, config, allFilePaths, processedFiles);
  const renderContext = createRenderContext(outputGeneratorContext);

  const compiledTemplate = getCompiledTemplate(config.output.style);

  return `${compiledTemplate(renderContext).trim()}\n`;
};

const buildOutputGeneratorContext = async (
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
      throw new RepopackError(`指示ファイルが ${instructionPath} で見つかりません`);
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

const getCompiledTemplate = (style: RepopackOutputStyle) => {
  if (!compiledTemplateCache[style]) {
    let compiledTemplate: HandlebarsTemplateDelegate;
    switch (style) {
      case 'xml':
        compiledTemplate = Handlebars.compile(getXmlTemplate());
        break;
      case 'markdown':
        compiledTemplate = Handlebars.compile(getMarkdownTemplate());
        break;
      case 'plain':
        compiledTemplate = Handlebars.compile(getPlainTemplate());
        break;
      default:
        throw new RepopackError(`Unknown output style: ${style}`);
    }
    compiledTemplateCache[style] = compiledTemplate;
  }
  return compiledTemplateCache[style];
};
