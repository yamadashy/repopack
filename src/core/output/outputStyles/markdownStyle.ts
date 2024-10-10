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
    includedFiles: outputGeneratorContext.includedFiles,
    partNumber: outputGeneratorContext.partNumber,
    totalParts: outputGeneratorContext.totalParts,
    totalPartFiles: outputGeneratorContext.includedFiles.length,
    totalFiles: outputGeneratorContext.totalFiles
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

## Repository Size
This file is part {{{partNumber}}} of {{{totalParts}}} of a split representation of the entire codebase.
This file contains {{{totalPartFiles}}} out of a total of {{{totalFiles}}} files.

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

{{#each includedFiles}}
## File: {{{this.path}}}
\`\`\`{{{getFileExtension this.path}}}
{{{this.content}}}
\`\`\`

{{/each}}

{{#if instruction}}
# Instruction
{{{instruction}}}
{{/if}}
`;

Handlebars.registerHelper('getFileExtension', (filePath) => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'vue':
      return 'vue';
    case 'py':
      return 'python';
    case 'rb':
      return 'ruby';
    case 'java':
      return 'java';
    case 'c':
    case 'cpp':
      return 'cpp';
    case 'cs':
      return 'csharp';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'php':
      return 'php';
    case 'swift':
      return 'swift';
    case 'kt':
      return 'kotlin';
    case 'scala':
      return 'scala';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
    case 'sass':
      return 'scss';
    case 'json':
      return 'json';
    case 'json5':
      return 'json5';
    case 'xml':
      return 'xml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'md':
      return 'markdown';
    case 'sh':
    case 'bash':
      return 'bash';
    case 'sql':
      return 'sql';
    case 'dockerfile':
      return 'dockerfile';
    case 'dart':
      return 'dart';
    case 'fs':
    case 'fsx':
      return 'fsharp';
    case 'r':
      return 'r';
    case 'pl':
    case 'pm':
      return 'perl';
    case 'lua':
      return 'lua';
    case 'groovy':
      return 'groovy';
    case 'hs':
      return 'haskell';
    case 'ex':
    case 'exs':
      return 'elixir';
    case 'erl':
      return 'erlang';
    case 'clj':
    case 'cljs':
      return 'clojure';
    case 'ps1':
      return 'powershell';
    case 'vb':
      return 'vb';
    case 'coffee':
      return 'coffeescript';
    case 'tf':
    case 'tfvars':
      return 'hcl';
    case 'proto':
      return 'protobuf';
    case 'pug':
      return 'pug';
    case 'graphql':
    case 'gql':
      return 'graphql';
    case 'toml':
      return 'toml';
    default:
      return '';
  }
});
