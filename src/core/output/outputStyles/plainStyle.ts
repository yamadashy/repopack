import Handlebars from 'handlebars';
import type { OutputGeneratorContext } from '../outputGeneratorTypes.js';
import {
  generateHeader,
  generateSummaryAdditionalInfo,
  generateSummaryFileFormat,
  generateSummaryNotes,
  generateSummaryPurpose,
  generateSummaryUsageGuidelines,
} from '../outputStyleDecorate.js';

export const generatePlainStyle = (outputGeneratorContext: OutputGeneratorContext) => {
  const template = Handlebars.compile(plainTemplate);

  const renderContext = {
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
    includedFiles: outputGeneratorContext.includedFiles,
    partNumber: outputGeneratorContext.partNumber,
    totalParts: outputGeneratorContext.totalParts,
    totalPartFiles: outputGeneratorContext.includedFiles.length,
    totalFiles: outputGeneratorContext.totalFiles
  };

  return `${template(renderContext).trim()}\n`;
};

const PLAIN_SEPARATOR = '='.repeat(16);
const PLAIN_LONG_SEPARATOR = '='.repeat(64);

const plainTemplate = `
{{{generationHeader}}}

${PLAIN_LONG_SEPARATOR}
File Summary
${PLAIN_LONG_SEPARATOR}

Purpose:
--------
{{{summaryPurpose}}}

File Format:
------------
{{{summaryFileFormat}}}
4. Multiple file entries, each consisting of:
  a. A separator line (================)
  b. The file path (File: path/to/file)
  c. Another separator line
  d. The full contents of the file
  e. A blank line

Usage Guidelines:
-----------------
{{{summaryUsageGuidelines}}}

Repository Size:
-----------------
This file is part {{{partNumber}}} of {{{totalParts}}} of a split representation of the entire codebase.
This file contains {{{totalPartFiles}}} out of a total of {{{totalFiles}}} files.

Notes:
------
{{{summaryNotes}}}

Additional Info:
----------------
{{#if headerText}}
User Provided Header:
-----------------------
{{{headerText}}}
{{/if}}

{{{summaryAdditionalInfo}}}

${PLAIN_LONG_SEPARATOR}
Repository Structure
${PLAIN_LONG_SEPARATOR}
{{{treeString}}}

${PLAIN_LONG_SEPARATOR}
Repository Files
${PLAIN_LONG_SEPARATOR}

{{#each includedFiles}}
${PLAIN_SEPARATOR}
File: {{{this.path}}}
${PLAIN_SEPARATOR}
{{{this.content}}}

{{/each}}

{{#if instruction}}
${PLAIN_LONG_SEPARATOR}
Instruction
${PLAIN_LONG_SEPARATOR}
{{{instruction}}}
{{/if}}

`;
