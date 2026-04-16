import { z } from 'zod';

export const sfSObjectSummarySchema = z.object({
  name: z.string(),
  label: z.string(),
  labelPlural: z.string(),
  custom: z.boolean(),
  queryable: z.boolean(),
  createable: z.boolean(),
  updateable: z.boolean(),
  deletable: z.boolean(),
  keyPrefix: z.string().nullable(),
});

export const sfFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.string(),
  custom: z.boolean(),
  nillable: z.boolean(),
  createable: z.boolean(),
  updateable: z.boolean(),
  length: z.number(),
  referenceTo: z.array(z.string()).nullable(),
  relationshipName: z.string().nullable(),
});

export const sfSObjectDescribeSchema = sfSObjectSummarySchema.extend({
  fields: z.array(sfFieldSchema),
});

export const sfDescribeGlobalSchema = z.object({
  encoding: z.string(),
  maxBatchSize: z.number(),
  sobjects: z.array(sfSObjectSummarySchema),
});

export const sfRecordSchema = z.record(z.string(), z.unknown());

export type SfSObjectSummary = z.infer<typeof sfSObjectSummarySchema>;
export type SfField = z.infer<typeof sfFieldSchema>;
export type SfSObjectDescribe = z.infer<typeof sfSObjectDescribeSchema>;
export type SfDescribeGlobal = z.infer<typeof sfDescribeGlobalSchema>;
export type SfRecord = z.infer<typeof sfRecordSchema>;
