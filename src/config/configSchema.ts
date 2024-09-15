import { z } from 'zod';
import { RepopackError } from '../shared/errorHandler.js';

export const repopackOutputStyleSchema = z.enum(['plain', 'xml']);

export type RepopackOutputStyle = z.infer<typeof repopackOutputStyleSchema>;

const repopackConfigBaseSchema = z.object({
  output: z
    .object({
      filePath: z.string().optional(),
      style: repopackOutputStyleSchema.optional(),
      headerText: z.string().optional(),
      instructionFilePath: z.string().optional(),
      removeComments: z.boolean().optional(),
      removeEmptyLines: z.boolean().optional(),
      topFilesLength: z.number().optional(),
      showLineNumbers: z.boolean().optional(),
    })
    .optional(),
  include: z.array(z.string()).optional(),
  ignore: z
    .object({
      useGitignore: z.boolean().optional(),
      useDefaultPatterns: z.boolean().optional(),
      customPatterns: z.array(z.string()).optional(),
    })
    .optional(),
  security: z
    .object({
      enableSecurityCheck: z.boolean().optional(),
    })
    .optional(),
});

export const repopackConfigDefaultSchema = repopackConfigBaseSchema.and(
  z.object({
    output: z.object({
      filePath: z.string(),
      style: repopackOutputStyleSchema,
      headerText: z.string().optional(),
      instructionFilePath: z.string().optional(),
      removeComments: z.boolean(),
      removeEmptyLines: z.boolean(),
      topFilesLength: z.number(),
      showLineNumbers: z.boolean(),
    }),
    include: z.array(z.string()),
    ignore: z.object({
      useGitignore: z.boolean(),
      useDefaultPatterns: z.boolean(),
      customPatterns: z.array(z.string()).optional(),
    }),
    security: z.object({
      enableSecurityCheck: z.boolean(),
    }),
  }),
);

export type RepopackConfigDefault = z.infer<typeof repopackConfigDefaultSchema>;

export const repopackConfigFileSchema = repopackConfigBaseSchema;

export type RepopackConfigFile = z.infer<typeof repopackConfigFileSchema>;

export const repopackConfigCliSchema = repopackConfigBaseSchema;

export type RepopackConfigCli = z.infer<typeof repopackConfigCliSchema>;

export const repopackConfigMergedSchema = repopackConfigDefaultSchema
  .and(repopackConfigFileSchema)
  .and(repopackConfigCliSchema)
  .and(
    z.object({
      cwd: z.string(),
    }),
  );

export type RepopackConfigMerged = z.infer<typeof repopackConfigMergedSchema>;
