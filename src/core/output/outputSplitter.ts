import type { ProcessedFile } from '../file/fileTypes.js';
import { TokenCounter } from '../tokenCount/tokenCount.js';

export interface OutputSplit {
  partNumber: number;
  tokenCount: number;
  includedFiles: ProcessedFile[]; // Add includedFiles property
}

export const splitOutput = (
  processedFiles: ProcessedFile[],
  maxTokensPerFile: number,
): OutputSplit[] => {
  const tokenCounter = new TokenCounter();
  const outputSplits: OutputSplit[] = [];
  let currentTokenCount = 0;
  let currentOutput = '';
  let currentIncludedFiles: ProcessedFile[] = []; // Initialize currentIncludedFiles

  for (const file of processedFiles) {
    const fileTokenCount = tokenCounter.countTokens(file.content, file.path);

    if (currentTokenCount + fileTokenCount > maxTokensPerFile) {
      // Start a new part
      outputSplits.push({
        partNumber: outputSplits.length+1,
        tokenCount: currentTokenCount,
        includedFiles: currentIncludedFiles, // Add includedFiles to the outputSplit
      });

      currentTokenCount = 0;
      currentOutput = '';
      currentIncludedFiles = []; // Reset currentIncludedFiles
    }

    currentOutput += file.content;
    currentTokenCount += fileTokenCount;
    currentIncludedFiles.push(file); // Add file path to currentIncludedFiles

  }

  if (currentIncludedFiles.length) {
    // Add the last part
    outputSplits.push({
      partNumber: outputSplits.length+1,
      tokenCount: currentTokenCount,
      includedFiles: currentIncludedFiles, // Add includedFiles to the outputSplit
    });
  }
  tokenCounter.free();

  return outputSplits;
};
