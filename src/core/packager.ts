import * as fs from 'node:fs/promises';
import path from 'node:path';
import type { SecretLintCoreResult } from '@secretlint/types';
import { RepopackConfigMerged } from '../config/configTypes.js';
import { sanitizeFiles as defaultSanitizeFiles } from '../utils/fileHandler.js';
import { generateOutput as defaultGenerateOutput } from './outputGenerator.js';
import { checkFileWithSecretLint, createSecretLintConfig } from '../utils/secretLintUtils.js';
import { filterFiles } from '../utils/filterUtils.js';

export interface Dependencies {
  generateOutput: typeof defaultGenerateOutput;
  sanitizeFiles: typeof defaultSanitizeFiles;
}

export interface PackResult {
  totalFiles: number;
  totalCharacters: number;
  fileCharCounts: Record<string, number>;
  suspiciousFilesResults: SecretLintCoreResult[];
}

export async function pack(
  rootDir: string,
  config: RepopackConfigMerged,
  deps: Dependencies = {
    generateOutput: defaultGenerateOutput,
    sanitizeFiles: defaultSanitizeFiles,
  },
): Promise<PackResult> {
  // Get all file paths that should be processed
  const filteredPaths = await filterFiles(rootDir, config);

  // Perform security check and filter out suspicious files
  const suspiciousFilesResults = await performSecurityCheck(filteredPaths, rootDir);
  const safeFilePaths = filteredPaths.filter(
    (filePath) => !suspiciousFilesResults.some((result) => result.filePath === path.join(rootDir, filePath)),
  );

  // Sanitize files and generate output
  const sanitizedFiles = await deps.sanitizeFiles(safeFilePaths, rootDir, config);
  await deps.generateOutput(rootDir, config, sanitizedFiles, safeFilePaths);

  // Metrics
  const totalFiles = sanitizedFiles.length;
  const totalCharacters = sanitizedFiles.reduce((sum, file) => sum + file.content.length, 0);
  const fileCharCounts: Record<string, number> = {};
  sanitizedFiles.forEach((file) => {
    fileCharCounts[file.path] = file.content.length;
  });

  return {
    totalFiles,
    totalCharacters,
    fileCharCounts,
    suspiciousFilesResults,
  };
}

async function performSecurityCheck(filePaths: string[], rootDir: string): Promise<SecretLintCoreResult[]> {
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
}
