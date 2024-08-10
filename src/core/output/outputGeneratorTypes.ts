import { RepopackConfigMerged } from '../../config/configTypes.js';
import { SanitizedFile } from '../file/fileSanitizer.js';

export interface OutputGeneratorContext {
  generationDate: string;
  treeString: string;
  sanitizedFiles: SanitizedFile[];
  config: RepopackConfigMerged;
}
