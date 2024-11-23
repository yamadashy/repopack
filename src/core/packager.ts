import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import clipboard from 'clipboardy';
import pMap from 'p-map';
import pc from 'picocolors';
import type { RepomixConfigMerged } from '../config/configSchema.js';
import { logger } from '../shared/logger.js';
import { getProcessConcurrency } from '../shared/processConcurrency.js';
import type { RepomixProgressCallback } from '../shared/types.js';
import { collectFiles } from './file/fileCollect.js';
import { processFiles } from './file/fileProcess.js';
import { searchFiles } from './file/fileSearch.js';
import { generateOutput } from './output/outputGenerate.js';
import { type SuspiciousFileResult, runSecurityCheck } from './security/securityCheck.js';
import { TokenCounter } from './tokenCount/tokenCount.js';

export interface PackResult {
  totalFiles: number;
  totalCharacters: number;
  totalTokens: number;
  fileCharCounts: Record<string, number>;
  fileTokenCounts: Record<string, number>;
  suspiciousFilesResults: SuspiciousFileResult[];
}

export const pack = async (
  rootDir: string,
  config: RepomixConfigMerged,
  progressCallback: RepomixProgressCallback = () => {},
  deps = {
    searchFiles,
    collectFiles,
    processFiles,
    runSecurityCheck,
    generateOutput,
  },
): Promise<PackResult> => {
  // Get all file paths considering the config
  progressCallback('Searching for files...');
  const filePaths = await deps.searchFiles(rootDir, config);

  // Collect raw files
  progressCallback('Collecting files...');
  const rawFiles = await deps.collectFiles(filePaths, rootDir);

  let safeRawFiles = rawFiles;
  let suspiciousFilesResults: SuspiciousFileResult[] = [];

  if (config.security.enableSecurityCheck) {
    // Perform security check and filter out suspicious files
    progressCallback('Running security check...');
    suspiciousFilesResults = await deps.runSecurityCheck(rawFiles, progressCallback);
    safeRawFiles = rawFiles.filter(
      (rawFile) => !suspiciousFilesResults.some((result) => result.filePath === rawFile.path),
    );
  }

  const safeFilePaths = safeRawFiles.map((file) => file.path);
  logger.trace('Safe files count:', safeRawFiles.length);

  // Process files (remove comments, etc.)
  progressCallback('Processing files...');
  const processedFiles = await deps.processFiles(safeRawFiles, config);

  // Generate output
  progressCallback('Generating output...');
  const output = await deps.generateOutput(rootDir, config, processedFiles, safeFilePaths);

  // Write output to file. path is relative to the cwd
  progressCallback('Writing output file...');
  const outputPath = path.resolve(config.cwd, config.output.filePath);
  logger.trace(`Writing output to: ${outputPath}`);
  await fs.writeFile(outputPath, output);

  if (config.output.copyToClipboard) {
    // Additionally copy to clipboard if flag is raised
    progressCallback('Copying to clipboard...');
    logger.trace('Copying output to clipboard');
    await clipboard.write(output);
  }

  // Setup token counter
  const tokenCounter = new TokenCounter();

  // Metrics
  progressCallback('Calculating metrics...');
  const fileMetrics = await pMap(
    processedFiles,
    async (file, index) => {
      const charCount = file.content.length;
      const tokenCount = tokenCounter.countTokens(file.content, file.path);

      progressCallback(`Calculating metrics... (${index + 1}/${processedFiles.length}) ${pc.dim(file.path)}`);

      // Sleep for a short time to prevent blocking the event loop
      await setTimeout(1);

      return { path: file.path, charCount, tokenCount };
    },
    {
      concurrency: getProcessConcurrency(),
    },
  );

  const totalFiles = processedFiles.length;
  const totalCharacters = output.length;
  const totalTokens = tokenCounter.countTokens(output);

  tokenCounter.free();

  const fileCharCounts: Record<string, number> = {};
  const fileTokenCounts: Record<string, number> = {};
  for (const file of fileMetrics) {
    fileCharCounts[file.path] = file.charCount;
    fileTokenCounts[file.path] = file.tokenCount;
  }

  return {
    totalFiles,
    totalCharacters,
    totalTokens,
    fileCharCounts,
    fileTokenCounts,
    suspiciousFilesResults,
  };
};
