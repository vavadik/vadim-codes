import { z } from 'zod/v4';
import { convertSync } from '@openapi-contrib/json-schema-to-openapi-schema';
import { generateOpenApiAsync, SchemaTransformerAsync } from '@ts-rest/open-api';
import { contract } from './contract';
import { healthDtoSchema } from './dtos/health.dto';
import { todoDtoSchema, createTodoDtoSchema, updateTodoDtoSchema } from './dtos/todo.dto';
import {
  sfDescribeGlobalSchema,
  sfFieldSchema,
  sfRecordSchema,
  sfSObjectDescribeSchema,
  sfSObjectSummarySchema,
} from './dtos/salesforce.dto';

type RouteMeta = {
  tags?: string[];
  requestExample?: unknown;
  responseExamples?: Record<number, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

const ZOD_4: SchemaTransformerAsync = async ({ schema }) => {
  if (schema instanceof z.core.$ZodType) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return convertSync(z.toJSONSchema(schema)) as any;
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zodToOpenApi(schema: z.ZodTypeAny): any {
  return convertSync(z.toJSONSchema(schema));
}

export async function generateOpenApiDocument() {
  const document = await generateOpenApiAsync(
    contract,
    { info: { title: 'Composer AI API', version: '1.0.0' } },
    {
      schemaTransformer: ZOD_4,
      operationMapper: (operation, appRoute) => {
        const meta = appRoute.metadata as RouteMeta | undefined;
        if (!meta) {
          return operation;
        }

        let result = { ...operation };

        if (meta.tags) {
          result = { ...result, tags: meta.tags };
        }

        if (meta.requestExample && result.requestBody && !('$ref' in result.requestBody)) {
          const rb = result.requestBody as { content?: AnyRecord };
          if (rb.content?.['application/json']) {
            result = {
              ...result,
              requestBody: {
                ...rb,
                content: {
                  ...rb.content,
                  'application/json': {
                    ...rb.content['application/json'],
                    example: meta.requestExample,
                  },
                },
              },
            };
          }
        }

        if (meta.responseExamples && result.responses) {
          const responses = { ...result.responses };
          for (const [status, example] of Object.entries(meta.responseExamples)) {
            const resp = responses[status];
            if (resp && !('$ref' in resp)) {
              const r = resp as { content?: AnyRecord };
              if (r.content?.['application/json']) {
                responses[status] = {
                  ...r,
                  content: {
                    ...r.content,
                    'application/json': { ...r.content['application/json'], example },
                  },
                };
              }
            }
          }
          result = { ...result, responses };
        }

        return result;
      },
    }
  );

  // Populate the Swagger UI "Schemas" section with named component schemas
  document.components ??= {};
  document.components.schemas ??= {};
  const schemas = document.components.schemas;
  const namedSchemas: Record<string, z.ZodTypeAny> = {
    HealthDto: healthDtoSchema,
    TodoDto: todoDtoSchema,
    CreateTodoDto: createTodoDtoSchema,
    UpdateTodoDto: updateTodoDtoSchema,
    SfSObjectSummary: sfSObjectSummarySchema,
    SfField: sfFieldSchema,
    SfSObjectDescribe: sfSObjectDescribeSchema,
    SfDescribeGlobal: sfDescribeGlobalSchema,
    SfRecord: sfRecordSchema,
  };
  for (const [name, schema] of Object.entries(namedSchemas)) {
    schemas[name] = zodToOpenApi(schema);
  }

  return document;
}
