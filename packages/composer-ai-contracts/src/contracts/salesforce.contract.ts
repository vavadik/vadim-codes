import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  sfDescribeGlobalSchema,
  sfRecordSchema,
  sfSObjectDescribeSchema,
} from '../dtos/salesforce.dto';

const c = initContract();

export const salesforceContract = c.router({
  sobjects: {
    method: 'GET',
    path: '/salesforce/sobjects',
    responses: {
      200: sfDescribeGlobalSchema,
    },
  },
  describe: {
    method: 'GET',
    path: '/salesforce/describe/:name',
    pathParams: z.object({ name: z.string() }),
    responses: {
      200: sfSObjectDescribeSchema,
      404: z.object({ message: z.string() }),
    },
  },
  getRecord: {
    method: 'GET',
    path: '/salesforce/:name/:id',
    pathParams: z.object({ name: z.string(), id: z.string() }),
    responses: {
      200: sfRecordSchema,
      404: z.object({ message: z.string() }),
    },
  },
});
