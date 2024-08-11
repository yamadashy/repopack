import Handlebars from 'handlebars';
import type { OutputGeneratorContext } from './outputGeneratorTypes.js';
import {
  generateHeader,
  generateSummaryAdditionalInfo,
  generateSummaryFileFormat,
  generateSummaryNotes,
  generateSummaryPurpose,
  generateSummaryUsageGuidelines,
} from './outputStyleDecorator.js';

const PLAIN_SEPARATOR = '='.repeat(16);
const PLAIN_LONG_SEPARATOR = '='.repeat(64);

export const generatePlainStyle = (outputGeneratorContext: OutputGeneratorContext) => {
  const template = Handlebars.compile(plainTemplate);

  const renderContext = {
    generationHeader: generateHeader(outputGeneratorContext.generationDate),
    plainSeparator: PLAIN_SEPARATOR,
    plainLongSeparator: PLAIN_LONG_SEPARATOR,
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

  return `${template(renderContext).trim()}\n`;
};

const plainTemplate = `
{{{generationHeader}}}

{{{plainLongSeparator}}}
File Summary
{{{plainLongSeparator}}}

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

{{{plainLongSeparator}}}
Repository Structure
{{{plainLongSeparator}}}
{{{treeString}}}

{{{plainLongSeparator}}}
Repository Files
{{{plainLongSeparator}}}

{{#each processedFiles}}
{{{../plainSeparator}}}
File: {{{this.path}}}
{{{../plainSeparator}}}
{{{this.content}}}

{{/each}}

{{#if instruction}}
{{{plainLongSeparator}}}
Instruction
{{{plainLongSeparator}}}
{{{instruction}}}
{{/if}}

`;
