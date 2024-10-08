import path from 'node:path';
import pc from 'picocolors';
import type { RepopackConfigMerged } from '../config/configTypes.js';
import type { SuspiciousFileResult } from '../core/security/securityCheck.js';
import { logger } from '../shared/logger.js';

export const printSummary = (
  totalFiles: number,
  totalCharacters: number,
  totalTokens: number,
  outputPath: string,
  suspiciousFilesResults: SuspiciousFileResult[],
  config: RepopackConfigMerged,
) => {
  let securityCheckMessage = '';
  if (config.security.enableSecurityCheck) {
    if (suspiciousFilesResults.length > 0) {
      securityCheckMessage = pc.yellow(`${suspiciousFilesResults.length} suspicious file(s) detected and excluded`);
    } else {
      securityCheckMessage = pc.white('✔ No suspicious files detected');
    }
  } else {
    securityCheckMessage = pc.dim('Security check disabled');
  }

  logger.log(pc.white('📊 Pack Summary:'));
  logger.log(pc.dim('────────────────'));
  logger.log(`${pc.white('  Total Files:')} ${pc.white(totalFiles.toString())}`);
  logger.log(`${pc.white('  Total Chars:')} ${pc.white(totalCharacters.toString())}`);
  logger.log(`${pc.white(' Total Tokens:')} ${pc.white(totalTokens.toString())}`);
  logger.log(`${pc.white('       Output:')} ${pc.white(outputPath)}`);
  logger.log(`${pc.white('     Security:')} ${pc.white(securityCheckMessage)}`);
};

export const printSecurityCheck = (
  rootDir: string,
  suspiciousFilesResults: SuspiciousFileResult[],
  config: RepopackConfigMerged,
) => {
  if (!config.security.enableSecurityCheck) {
    return;
  }

  logger.log(pc.white('🔎 Security Check:'));
  logger.log(pc.dim('──────────────────'));

  if (suspiciousFilesResults.length === 0) {
    logger.log(`${pc.green('✔')} ${pc.white('No suspicious files detected.')}`);
  } else {
    logger.log(pc.yellow(`${suspiciousFilesResults.length} suspicious file(s) detected and excluded from the output:`));
    suspiciousFilesResults.forEach((suspiciousFilesResult, index) => {
      const relativeFilePath = path.relative(rootDir, suspiciousFilesResult.filePath);
      logger.log(`${pc.white(`${index + 1}.`)} ${pc.white(relativeFilePath)}`);
      logger.log(pc.dim(`   - ${suspiciousFilesResult.messages.join('\n   - ')}`));
    });
    logger.log(pc.yellow('\nThese files have been excluded from the output for security reasons.'));
    logger.log(pc.yellow('Please review these files for potential sensitive information.'));
  }
};

export const printTopFiles = (
  fileCharCounts: Record<string, number>,
  fileTokenCounts: Record<string, number>,
  topFilesLength: number,
) => {
  logger.log(pc.white(`📈 Top ${topFilesLength} Files by Character Count and Token Count:`));
  logger.log(pc.dim('──────────────────────────────────────────────────────'));

  const topFiles = Object.entries(fileCharCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topFilesLength);

  topFiles.forEach(([filePath, charCount], index) => {
    const tokenCount = fileTokenCounts[filePath];
    const indexString = `${index + 1}.`.padEnd(3, ' ');
    logger.log(
      `${pc.white(`${indexString}`)} ${pc.white(filePath)} ${pc.dim(`(${charCount} chars, ${tokenCount} tokens)`)}`,
    );
  });
};

export const printCompletion = () => {
  logger.log(pc.green('🎉 All Done!'));
  logger.log(pc.white('Your repository has been successfully packed.'));
};
