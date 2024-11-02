import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as prompts from '@clack/prompts';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { runMigrationAction } from '../../../src/cli/actions/migrationAction.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('node:fs/promises');
vi.mock('@clack/prompts');
vi.mock('../../../src/shared/logger');

describe('migrationAction', () => {
  const mockRootDir = '/test/dir';
  const oldConfigPath = path.join(mockRootDir, 'repopack.config.json');
  const newConfigPath = path.join(mockRootDir, 'repomix.config.json');
  const oldIgnorePath = path.join(mockRootDir, '.repopackignore');
  const newIgnorePath = path.join(mockRootDir, '.repomixignore');
  const oldInstructionPath = path.join(mockRootDir, 'repopack-instruction.md');
  const newInstructionPath = path.join(mockRootDir, 'repomix-instruction.md');
  const gitignorePath = path.join(mockRootDir, '.gitignore');

  const mockOutputPaths = {
    oldTxt: path.join(mockRootDir, 'repopack-output.txt'),
    newTxt: path.join(mockRootDir, 'repomix-output.txt'),
    oldXml: path.join(mockRootDir, 'repopack-output.xml'),
    newXml: path.join(mockRootDir, 'repomix-output.xml'),
    oldMd: path.join(mockRootDir, 'repopack-output.md'),
    newMd: path.join(mockRootDir, 'repomix-output.md'),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should migrate all files when they exist', async () => {
    // Mock file existence checks
    vi.mocked(fs.access).mockImplementation(async (path) => {
      if (
        path === oldConfigPath ||
        path === oldIgnorePath ||
        path === oldInstructionPath ||
        path === mockOutputPaths.oldTxt ||
        path === mockOutputPaths.oldXml
      ) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('File not found'));
    });

    // Mock file content
    const mockConfigContent = JSON.stringify({
      output: {
        filePath: 'repopack-output.txt',
        instructionFilePath: 'repopack-instruction.md',
      },
    });
    const mockIgnoreContent = 'repopack-output.txt\n*.log';
    const mockInstructionContent = '# Repopack Instructions';
    const mockOutputContent = 'Repopack output content';

    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === oldConfigPath) return mockConfigContent;
      if (path === oldIgnorePath) return mockIgnoreContent;
      if (path === oldInstructionPath) return mockInstructionContent;
      if (path === mockOutputPaths.oldTxt || path === mockOutputPaths.oldXml) {
        return mockOutputContent;
      }
      return '';
    });

    // Mock user confirmation
    vi.mocked(prompts.confirm).mockResolvedValue(true);

    // Run migration
    const result = await runMigrationAction(mockRootDir);

    // Verify results
    expect(result.configMigrated).toBe(true);
    expect(result.ignoreMigrated).toBe(true);
    expect(result.instructionMigrated).toBe(true);
    expect(result.outputFilesMigrated).toContain(mockOutputPaths.newTxt);
    expect(result.outputFilesMigrated).toContain(mockOutputPaths.newXml);
    expect(result.error).toBeUndefined();

    // Verify file operations for config
    expect(fs.writeFile).toHaveBeenCalledWith(
      newConfigPath,
      JSON.stringify(
        {
          output: {
            filePath: 'repomix-output.txt',
            instructionFilePath: 'repomix-instruction.md',
          },
        },
        null,
        2,
      ),
      'utf8',
    );

    // Verify other file operations
    expect(fs.writeFile).toHaveBeenCalledWith(newIgnorePath, 'repomix-output.txt\n*.log', 'utf8');
    expect(fs.writeFile).toHaveBeenCalledWith(newInstructionPath, '# Repomix Instructions', 'utf8');

    // Verify old files were removed
    expect(fs.unlink).toHaveBeenCalledWith(oldConfigPath);
    expect(fs.unlink).toHaveBeenCalledWith(oldIgnorePath);
    expect(fs.unlink).toHaveBeenCalledWith(oldInstructionPath);
    expect(fs.unlink).toHaveBeenCalledWith(mockOutputPaths.oldTxt);
    expect(fs.unlink).toHaveBeenCalledWith(mockOutputPaths.oldXml);
  });

  test('should update gitignore content when it exists and contains repopack references', async () => {
    // Mock file existence only for gitignore and oldConfig
    vi.mocked(fs.access).mockImplementation(async (path) => {
      if (path === gitignorePath || path === oldConfigPath) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('File not found'));
    });

    // Mock file content only for gitignore
    const mockGitignoreContent = 'node_modules/\nrepopack-output.txt';
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === gitignorePath) return mockGitignoreContent;
      if (path === oldConfigPath) return '{}';
      return '';
    });

    // Mock user confirmation
    vi.mocked(prompts.confirm).mockResolvedValue(true);

    // Run migration
    await runMigrationAction(mockRootDir);

    // Verify gitignore was updated
    expect(fs.writeFile).toHaveBeenCalledWith(gitignorePath, 'node_modules/\nrepomix-output.txt', 'utf8');
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Updated repopack references in'));
  });

  test('should handle non-updated files correctly', async () => {
    // Mock file existence only for gitignore and oldConfig
    vi.mocked(fs.access).mockImplementation(async (path) => {
      if (path === gitignorePath || path === oldConfigPath) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('File not found'));
    });

    // Mock file content with no repopack references
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === gitignorePath) return 'node_modules/\n*.log';
      if (path === oldConfigPath) return '{}';
      return '';
    });

    // Mock user confirmation
    vi.mocked(prompts.confirm).mockResolvedValue(true);

    // Run migration
    await runMigrationAction(mockRootDir);

    // Verify no gitignore update was performed
    expect(fs.writeFile).not.toHaveBeenCalledWith(gitignorePath, expect.any(String), expect.any(String));
    // Verify debug message was logged
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('No changes needed in'));
  });

  test('should skip migration when no old files exist', async () => {
    // Mock all files not existing
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));

    // Run migration
    const result = await runMigrationAction(mockRootDir);

    // Verify no migration occurred
    expect(result.configMigrated).toBe(false);
    expect(result.ignoreMigrated).toBe(false);
    expect(result.instructionMigrated).toBe(false);
    expect(result.outputFilesMigrated).toHaveLength(0);
    expect(prompts.confirm).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('No Repopack files found to migrate.');
  });

  test('should skip files when they already exist and user declines overwrite', async () => {
    // Mock old and new files existing
    vi.mocked(fs.access).mockResolvedValue(undefined);

    // Mock user confirming migration but declining overwrites
    vi.mocked(prompts.confirm)
      .mockResolvedValueOnce(true) // Migration confirmation
      .mockResolvedValue(false); // All overwrite confirmations

    // Run migration
    const result = await runMigrationAction(mockRootDir);

    // Verify nothing was migrated
    expect(result.configMigrated).toBe(false);
    expect(result.ignoreMigrated).toBe(false);
    expect(result.instructionMigrated).toBe(false);
    expect(result.outputFilesMigrated).toHaveLength(0);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Skipping migration'));
  });
});
