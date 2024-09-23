import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  repopackConfigBaseSchema,
  repopackConfigCliSchema,
  repopackConfigDefaultSchema,
  repopackConfigFileSchema,
  repopackConfigMergedSchema,
  repopackOutputStyleSchema,
} from '../../src/config/configSchema.js';

describe('configSchema', () => {
  describe('repopackOutputStyleSchema', () => {
    it('should accept valid output styles', () => {
      expect(repopackOutputStyleSchema.parse('plain')).toBe('plain');
      expect(repopackOutputStyleSchema.parse('xml')).toBe('xml');
    });

    it('should reject invalid output styles', () => {
      expect(() => repopackOutputStyleSchema.parse('invalid')).toThrow(z.ZodError);
    });
  });

  describe('repopackConfigBaseSchema', () => {
    it('should accept valid base config', () => {
      const validConfig = {
        output: {
          filePath: 'output.txt',
          style: 'plain',
          removeComments: true,
        },
        include: ['**/*.js'],
        ignore: {
          useGitignore: true,
          customPatterns: ['node_modules'],
        },
        security: {
          enableSecurityCheck: true,
        },
      };
      expect(repopackConfigBaseSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should accept empty object', () => {
      expect(repopackConfigBaseSchema.parse({})).toEqual({});
    });

    it('should reject invalid types', () => {
      const invalidConfig = {
        output: {
          filePath: 123, // Should be string
          style: 'invalid', // Should be 'plain' or 'xml'
        },
        include: 'not-an-array', // Should be an array
      };
      expect(() => repopackConfigBaseSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });
  });

  describe('repopackConfigDefaultSchema', () => {
    it('should accept valid default config', () => {
      const validConfig = {
        output: {
          filePath: 'output.txt',
          style: 'plain',
          removeComments: false,
          removeEmptyLines: false,
          topFilesLength: 5,
          showLineNumbers: false,
        },
        include: [],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
        },
        security: {
          enableSecurityCheck: true,
        },
      };
      expect(repopackConfigDefaultSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should reject incomplete config', () => {
      const incompleteConfig = {
        output: {
          filePath: 'output.txt',
          // Missing required fields
        },
      };
      expect(() => repopackConfigDefaultSchema.parse(incompleteConfig)).toThrow(z.ZodError);
    });
  });

  describe('repopackConfigFileSchema', () => {
    it('should accept valid file config', () => {
      const validConfig = {
        output: {
          filePath: 'custom-output.txt',
          style: 'xml',
        },
        ignore: {
          customPatterns: ['*.log'],
        },
      };
      expect(repopackConfigFileSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should accept partial config', () => {
      const partialConfig = {
        output: {
          filePath: 'partial-output.txt',
        },
      };
      expect(repopackConfigFileSchema.parse(partialConfig)).toEqual(partialConfig);
    });
  });

  describe('repopackConfigCliSchema', () => {
    it('should accept valid CLI config', () => {
      const validConfig = {
        output: {
          filePath: 'cli-output.txt',
          showLineNumbers: true,
        },
        include: ['src/**/*.ts'],
      };
      expect(repopackConfigCliSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should reject invalid CLI options', () => {
      const invalidConfig = {
        output: {
          filePath: 123, // Should be string
        },
      };
      expect(() => repopackConfigCliSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });
  });

  describe('repopackConfigMergedSchema', () => {
    it('should accept valid merged config', () => {
      const validConfig = {
        cwd: '/path/to/project',
        output: {
          filePath: 'merged-output.txt',
          style: 'plain',
          removeComments: true,
          removeEmptyLines: false,
          topFilesLength: 10,
          showLineNumbers: true,
        },
        include: ['**/*.js', '**/*.ts'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
          customPatterns: ['*.log'],
        },
        security: {
          enableSecurityCheck: true,
        },
      };
      expect(repopackConfigMergedSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should reject merged config missing required fields', () => {
      const invalidConfig = {
        cwd: '/path/to/project',
        // Missing required output field
      };
      expect(() => repopackConfigMergedSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });

    it('should reject merged config with invalid types', () => {
      const invalidConfig = {
        cwd: '/path/to/project',
        output: {
          filePath: 'output.txt',
          style: 'plain',
          removeComments: 'not-a-boolean', // Should be boolean
          removeEmptyLines: false,
          topFilesLength: '5', // Should be number
          showLineNumbers: false,
        },
        include: ['**/*.js'],
        ignore: {
          useGitignore: true,
          useDefaultPatterns: true,
        },
        security: {
          enableSecurityCheck: true,
        },
      };
      expect(() => repopackConfigMergedSchema.parse(invalidConfig)).toThrow(z.ZodError);
    });
  });
});
