import { z } from 'zod/v4';
import convert from '@openapi-contrib/json-schema-to-openapi-schema';
import { generateOpenApi, SchemaTransformerAsync } from '@ts-rest/open-api';
import { contract } from './contract';

const ZOD_4_ASYNC: SchemaTransformerAsync = async ({ schema }) => {
  if (schema instanceof z.core.$ZodAny) {
    const jsonSchema = z.toJSONSchema(schema);

    return await convert(jsonSchema);
  }

  return null;
};

export async function generateOpenApiDocument() {
  return generateOpenApi(
    contract,
    { info: { title: 'Boilerplate API', version: '1.0.0' } },
    { schemaTransformer: ZOD_4_ASYNC }
  );
}
