import * as fs from 'node:fs/promises';
import path from 'node:path';
import { Tiktoken, get_encoding } from 'tiktoken';
import type { SecretLintCoreResult } from '@secretlint/types';
import { RepopackConfigMerged } from '../config/configTypes.js';
import { sanitizeFiles as defaultSanitizeFiles } from '../utils/fileHandler.js';
import { generateOutput as defaultGenerateOutput } from './outputGenerator.js';
import { checkFileWithSecretLint, createSecretLintConfig } from '../utils/secretLintUtils.js';
import { searchFiles } from '../utils/searchUtils.js';

export interface Dependencies {
  generateOutput: typeof defaultGenerateOutput;
  sanitizeFiles: typeof defaultSanitizeFiles;
}

export interface PackResult {
  totalFiles: number;
  totalCharacters: number;
  totalTokens: number;
  fileCharCounts: Record<string, number>;
  fileTokenCounts: Record<string, number>;
  suspiciousFilesResults: SecretLintCoreResult[];
}

export const pack = async (
  rootDir: string,
  config: RepopackConfigMerged,
  deps: Dependencies = {
    generateOutput: defaultGenerateOutput,
    sanitizeFiles: defaultSanitizeFiles,
  },
): Promise<PackResult> => {
  // Get all file paths that should be processed
  const filePaths = await searchFiles(rootDir, config);

  // Perform security check and filter out suspicious files
  const suspiciousFilesResults = await performSecurityCheck(filePaths, rootDir);
  const safeFilePaths = filePaths.filter(
    (filePath) => !suspiciousFilesResults.some((result) => result.filePath === path.join(rootDir, filePath)),
  );

  // Sanitize files and generate output
  const sanitizedFiles = await deps.sanitizeFiles(safeFilePaths, rootDir, config);
  await deps.generateOutput(rootDir, config, sanitizedFiles, safeFilePaths);

  // Setup encoding
  const encoding: Tiktoken = get_encoding('cl100k_base');

  // Metrics
  const totalFiles = sanitizedFiles.length;
  const totalCharacters = sanitizedFiles.reduce((sum, file) => sum + file.content.length, 0);
  const totalTokens = sanitizedFiles.reduce((sum, file) => sum + encoding.encode(file.content).length, 0);
  const fileCharCounts: Record<string, number> = {};
  const fileTokenCounts: Record<string, number> = {};
  sanitizedFiles.forEach((file) => {
    fileCharCounts[file.path] = file.content.length;
    fileTokenCounts[file.path] = encoding.encode(file.content).length;
  });
  encoding.free();

  return {
    totalFiles,
    totalCharacters,
    totalTokens,
    fileCharCounts,
    fileTokenCounts,
    suspiciousFilesResults,
  };
};

const performSecurityCheck = async (filePaths: string[], rootDir: string): Promise<SecretLintCoreResult[]> => {
  const secretLintConfig = createSecretLintConfig();
  const suspiciousFilesResults: SecretLintCoreResult[] = [];

  for (const filePath of filePaths) {
    const fullPath = path.join(rootDir, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const secretLintResult = await checkFileWithSecretLint(fullPath, content, secretLintConfig);
    const isSuspicious = secretLintResult.messages.length > 0;
    if (isSuspicious) {
      suspiciousFilesResults.push(secretLintResult);
    }
  }

  return suspiciousFilesResults;
};
