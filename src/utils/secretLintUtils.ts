import type { SecretLintCoreConfig } from '@secretlint/types';
import { lintSource } from '@secretlint/core';
import { creator } from '@secretlint/secretlint-rule-preset-recommend';

export async function checkFileWithSecretLint(
  filePath: string,
  content: string,
  config: SecretLintCoreConfig,
): Promise<boolean> {
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

  return result.messages.length > 0;
}

export function createSecretLintConfig(): SecretLintCoreConfig {
  return {
    rules: [
      {
        id: '@secretlint/secretlint-rule-preset-recommend',
        rule: creator,
      },
    ],
  };
}
