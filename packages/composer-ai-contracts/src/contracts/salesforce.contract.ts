import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  sfDescribeGlobalSchema,
  sfRecordSchema,
  sfSObjectDescribeSchema,
} from '../dtos/salesforce.dto';

const c = initContract();

const exampleSObjectSummary = {
  name: 'Account',
  label: 'Account',
  labelPlural: 'Accounts',
  custom: false,
  queryable: true,
  createable: true,
  updateable: true,
  deletable: true,
  keyPrefix: '001',
};

const exampleField = {
  name: 'Name',
  label: 'Account Name',
  type: 'string',
  custom: false,
  nillable: false,
  createable: true,
  updateable: true,
  length: 255,
  referenceTo: null,
  relationshipName: null,
};

export const salesforceContract = c.router({
  sobjects: {
    method: 'GET',
    path: '/salesforce/sobjects',
    summary: 'List SObjects',
    description: 'Returns metadata for all available Salesforce SObjects in the connected org.',
    metadata: {
      tags: ['Salesforce'],
      responseExamples: {
        200: { encoding: 'UTF-8', maxBatchSize: 200, sobjects: [exampleSObjectSummary] },
      },
    },
    responses: {
      200: sfDescribeGlobalSchema,
    },
  },
  describe: {
    method: 'GET',
    path: '/salesforce/describe/:name',
    summary: 'Describe SObject',
    description: 'Returns field-level metadata for the given Salesforce SObject.',
    metadata: {
      tags: ['Salesforce'],
      responseExamples: {
        200: { ...exampleSObjectSummary, fields: [exampleField] },
        404: { message: 'SObject not found' },
      },
    },
    pathParams: z.object({ name: z.string().describe('API name of the SObject (e.g. Account)') }),
    responses: {
      200: sfSObjectDescribeSchema,
      404: z.object({ message: z.string() }),
    },
  },
  getRecord: {
    method: 'GET',
    path: '/salesforce/:name/:id',
    summary: 'Get record',
    description: 'Retrieves a single Salesforce record by SObject name and record ID.',
    metadata: {
      tags: ['Salesforce'],
      responseExamples: {
        200: { Id: '0015g00000XyzAbcAAE', Name: 'Acme Corp', Industry: 'Technology' },
        404: { message: 'Record not found' },
      },
    },
    pathParams: z.object({
      name: z.string().describe('API name of the SObject (e.g. Account)'),
      id: z.string().describe('18-character Salesforce record ID'),
    }),
    responses: {
      200: sfRecordSchema,
      404: z.object({ message: z.string() }),
    },
  },
});
