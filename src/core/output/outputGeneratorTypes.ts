import type { RepopackConfigMerged } from '../../config/configTypes.js';
import type { ProcessedFile } from '../file/fileTypes.js';

export interface OutputGeneratorContext {
  generationDate: string;
  treeString: string;
  config: RepopackConfigMerged;
  instruction: string;
  content: string;
  includedFiles: ProcessedFile[]; // Add the includedFiles property
  totalFiles: number,
  partNumber: number,
  totalParts: number
}
