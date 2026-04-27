import { config } from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

config({ path: resolve(__dirname, '../../.env') });
config();

const baseUrl = process.env['DATABASE_URL'];
const dbName = process.env['SANDBOX_DB_NAME'];

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: baseUrl && dbName ? `${baseUrl}/${dbName}` : baseUrl,
  },
});
