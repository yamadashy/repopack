import { z } from 'zod';
import { RepomixError } from '../shared/errorHandle.js';

export const repomixOutputStyleSchema = z.enum(['plain', 'xml', 'markdown']);

export const repomixConfigBaseSchema = z.object({
  output: z
    .object({
      filePath: z.string().optional(),
      style: repomixOutputStyleSchema.optional(),
      headerText: z.string().optional(),
      instructionFilePath: z.string().optional(),
      removeComments: z.boolean().optional(),
      removeEmptyLines: z.boolean().optional(),
      topFilesLength: z.number().optional(),
      showLineNumbers: z.boolean().optional(),
      copyToClipboard: z.boolean().optional(),
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

export const repomixConfigDefaultSchema = repomixConfigBaseSchema.and(
  z.object({
    output: z.object({
      filePath: z.string(),
      style: repomixOutputStyleSchema,
      headerText: z.string().optional(),
      instructionFilePath: z.string().optional(),
      removeComments: z.boolean(),
      removeEmptyLines: z.boolean(),
      topFilesLength: z.number(),
      showLineNumbers: z.boolean(),
      copyToClipboard: z.boolean(),
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

export const repomixConfigFileSchema = repomixConfigBaseSchema;

export const repomixConfigCliSchema = repomixConfigBaseSchema;

export const repomixConfigMergedSchema = repomixConfigDefaultSchema
  .and(repomixConfigFileSchema)
  .and(repomixConfigCliSchema)
  .and(
    z.object({
      cwd: z.string(),
    }),
  );

export type RepomixOutputStyle = z.infer<typeof repomixOutputStyleSchema>;

export type RepomixConfigDefault = z.infer<typeof repomixConfigDefaultSchema>;

export type RepomixConfigFile = z.infer<typeof repomixConfigFileSchema>;

export type RepomixConfigCli = z.infer<typeof repomixConfigCliSchema>;

export type RepomixConfigMerged = z.infer<typeof repomixConfigMergedSchema>;
