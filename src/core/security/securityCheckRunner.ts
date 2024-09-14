import { lintSource } from '@secretlint/core';
import { creator } from '@secretlint/secretlint-rule-preset-recommend';
import type { SecretLintCoreConfig, SecretLintCoreResult } from '@secretlint/types';
import pMap from 'p-map';
import pc from 'picocolors';
import { logger } from '../../shared/logger.js';
import { getProcessConcurrency } from '../../shared/processConcurrency.js';
import { sleep } from '../../shared/sleep.js';
import type { RepopackProgressCallback } from '../../shared/types.js';
import type { RawFile } from '../file/fileTypes.js';

export interface SuspiciousFileResult {
  filePath: string;
  messages: string[];
}

export const runSecurityCheck = async (
  rawFiles: RawFile[],
  progressCallback: RepopackProgressCallback = () => {},
): Promise<SuspiciousFileResult[]> => {
  const secretLintConfig = createSecretLintConfig();

  const results = await pMap(
    rawFiles,
    async (rawFile, index) => {
      const secretLintResult = await runSecretLint(rawFile.path, rawFile.content, secretLintConfig);

      if (secretLintResult.messages.length > 0) {
        return {
          filePath: rawFile.path,
          messages: secretLintResult.messages.map((message) => message.message),
        };
      }

      progressCallback(`Running security check... (${index + 1}/${rawFiles.length}) ${pc.dim(rawFile.path)}`);

      // Sleep for a short time to prevent blocking the event loop
      await sleep(1);

      return null;
    },
    {
      concurrency: getProcessConcurrency(),
    },
  );

  return results.filter((result): result is SuspiciousFileResult => result != null);
};

export const runSecretLint = async (
  filePath: string,
  content: string,
  config: SecretLintCoreConfig,
): Promise<SecretLintCoreResult> => {
  const result = await lintSource({
    source: {
      filePath: filePath,
      content: content,
      ext: filePath.split('.').pop() || '',
      contentType: 'text',
    },
    options: {
      config: config,
    },
  });

  if (result.messages.length > 0) {
    logger.trace(`Found ${result.messages.length} issues in ${filePath}`);
    logger.trace(result.messages.map((message) => `  - ${message.message}`).join('\n'));
  }

  return result;
};

export const createSecretLintConfig = (): SecretLintCoreConfig => ({
  rules: [
    {
      id: '@secretlint/secretlint-rule-preset-recommend',
      rule: creator,
    },
  ],
});
