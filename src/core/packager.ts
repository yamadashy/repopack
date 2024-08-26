import * as fs from 'node:fs/promises';
import path from 'node:path';
import pMap from 'p-map';
import type { RepopackConfigMerged } from '../config/configTypes.js';
import { logger } from '../shared/logger.js';
import { getProcessConcurrency } from '../shared/processConcurrency.js';
import { collectFiles as defaultCollectFiles } from './file/fileCollector.js';
import { processFiles as defaultProcessFiles } from './file/fileProcessor.js';
import { searchFiles as defaultSearchFiles } from './file/fileSearcher.js';
import { generateOutput as defaultGenerateOutput } from './output/outputGenerator.js';
import {
  type SuspiciousFileResult,
  runSecurityCheck as defaultRunSecurityCheck,
} from './security/securityCheckRunner.js';
import { TokenCounter } from './tokenCounter/tokenCounter.js';

export interface PackDependencies {
  searchFiles: typeof defaultSearchFiles;
  collectFiles: typeof defaultCollectFiles;
  processFiles: typeof defaultProcessFiles;
  runSecurityCheck: typeof defaultRunSecurityCheck;
  generateOutput: typeof defaultGenerateOutput;
}

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
  config: RepopackConfigMerged,
  deps: PackDependencies = {
    searchFiles: defaultSearchFiles,
    collectFiles: defaultCollectFiles,
    processFiles: defaultProcessFiles,
    runSecurityCheck: defaultRunSecurityCheck,
    generateOutput: defaultGenerateOutput,
  },
): Promise<PackResult> => {
  // Get all file paths considering the config
  const filePaths = await deps.searchFiles(rootDir, config);

  // Collect raw files
  const rawFiles = await deps.collectFiles(filePaths, rootDir);

  // Perform security check and filter out suspicious files
  const suspiciousFilesResults = await deps.runSecurityCheck(rawFiles);
  const safeRawFiles = rawFiles.filter(
    (rawFile) => !suspiciousFilesResults.some((result) => result.filePath === rawFile.path),
  );
  const safeFilePaths = safeRawFiles.map((file) => file.path);

  // Process files (remove comments, etc.)
  const processedFiles = await deps.processFiles(safeRawFiles, config);

  // Generate output
  const output = await deps.generateOutput(config, processedFiles, safeFilePaths);

  // Write output to file. path is relative to the cwd
  const outputPath = path.resolve(config.cwd, config.output.filePath);
  logger.trace(`Writing output to: ${outputPath}`);
  await fs.writeFile(outputPath, output);

  // Setup token counter
  const tokenCounter = new TokenCounter();

  // Metrics
  const fileMetrics = await pMap(
    processedFiles,
    async (file) => {
      const charCount = file.content.length;
      const tokenCount = tokenCounter.countTokens(file.content);
      return { path: file.path, charCount, tokenCount };
    },
    {
      concurrency: getProcessConcurrency(),
    },
  );

  tokenCounter.free();

  const totalFiles = processedFiles.length;
  const totalCharacters = fileMetrics.reduce((sum, fileMetric) => sum + fileMetric.charCount, 0);
  const totalTokens = fileMetrics.reduce((sum, fileMetric) => sum + fileMetric.tokenCount, 0);

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
