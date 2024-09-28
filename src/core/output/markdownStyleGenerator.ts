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

export const generateMarkdownStyle = (outputGeneratorContext: OutputGeneratorContext) => {
  const template = Handlebars.compile(markdownTemplate);

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
    processedFiles: outputGeneratorContext.processedFiles,
  };

  return `${template(renderContext).trim()}\n`;
};

const markdownTemplate = /* md */ `
{{{generationHeader}}}

# File Summary

## Purpose
{{{summaryPurpose}}}

## File Format
{{{summaryFileFormat}}}
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
{{{summaryUsageGuidelines}}}

## Notes
{{{summaryNotes}}}

## Additional Info
{{#if headerText}}
### User Provided Header
{{{headerText}}}
{{/if}}

{{{summaryAdditionalInfo}}}

# Repository Structure
\`\`\`
{{{treeString}}}
\`\`\`

# Repository Files

{{#each processedFiles}}
## File: {{{this.path}}}
\`\`\`
{{{this.content}}}
\`\`\`

{{/each}}

{{#if instruction}}
# Instruction
{{{instruction}}}
{{/if}}
`;
