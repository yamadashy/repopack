import type { RepomixConfigMerged } from '../../config/configTypes.js';
import type { ProcessedFile } from '../file/fileTypes.js';

export interface OutputGeneratorContext {
  generationDate: string;
  treeString: string;
  processedFiles: ProcessedFile[];
  config: RepomixConfigMerged;
  instruction: string;
}
