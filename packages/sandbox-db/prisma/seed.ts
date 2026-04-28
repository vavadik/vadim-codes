import { config } from 'dotenv';
import { resolve } from 'node:path';
import { createPrismaClient } from '../src/index';

config({ path: resolve(__dirname, '../../../.env') });
config();

const prisma = createPrismaClient(process.env['DATABASE_URL']!);

async function main() {
  console.log('Seeding...');
  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
