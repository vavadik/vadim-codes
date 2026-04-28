import { z } from 'zod';

export const sfSObjectSummarySchema = z.object({
  name: z.string().describe('API name of the SObject (e.g. Account)'),
  label: z.string().describe('Human-readable singular label'),
  labelPlural: z.string().describe('Human-readable plural label'),
  custom: z.boolean().describe('True if this is a custom object'),
  queryable: z.boolean().describe('Whether the SObject can be queried via SOQL'),
  createable: z.boolean().describe('Whether records can be created'),
  updateable: z.boolean().describe('Whether records can be updated'),
  deletable: z.boolean().describe('Whether records can be deleted'),
  keyPrefix: z.string().nullable().describe('3-character ID prefix, or null if not applicable'),
});

export const sfFieldSchema = z.object({
  name: z.string().describe('API field name'),
  label: z.string().describe('Human-readable field label'),
  type: z.string().describe('Salesforce field type (e.g. string, boolean, reference)'),
  custom: z.boolean().describe('True if this is a custom field'),
  nillable: z.boolean().describe('Whether the field can hold a null value'),
  createable: z.boolean().describe('Whether the field can be set on record creation'),
  updateable: z.boolean().describe('Whether the field can be updated'),
  length: z.number().describe('Maximum character length (0 for non-string types)'),
  referenceTo: z
    .array(z.string())
    .nullable()
    .describe('SObject names this field references, or null'),
  relationshipName: z
    .string()
    .nullable()
    .describe('Relationship API name for reference fields, or null'),
});

export const sfSObjectDescribeSchema = sfSObjectSummarySchema.extend({
  fields: z.array(sfFieldSchema).describe('All fields defined on this SObject'),
});

export const sfDescribeGlobalSchema = z.object({
  encoding: z.string().describe('Character encoding used by the org (e.g. UTF-8)'),
  maxBatchSize: z.number().describe('Maximum records per batch operation'),
  sobjects: z.array(sfSObjectSummarySchema).describe('All SObjects available in the org'),
});

export const sfRecordSchema = z
  .record(z.string(), z.unknown())
  .describe('Salesforce record fields keyed by API name');

export type SfSObjectSummary = z.infer<typeof sfSObjectSummarySchema>;
export type SfField = z.infer<typeof sfFieldSchema>;
export type SfSObjectDescribe = z.infer<typeof sfSObjectDescribeSchema>;
export type SfDescribeGlobal = z.infer<typeof sfDescribeGlobalSchema>;
export type SfRecord = z.infer<typeof sfRecordSchema>;
