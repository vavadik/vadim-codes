import { config } from 'dotenv';
import { resolve } from 'node:path';
import { createPrismaClient } from '../src/index';

config({ path: resolve(__dirname, '../../../.env') });
config();

const prisma = createPrismaClient(process.env['DATABASE_URL']!);

async function main() {
  console.log('Seeding...');

  await prisma.todo.deleteMany();

  await prisma.todo.createMany({
    data: [
      { title: 'Set up the monorepo', done: true },
      { title: 'Add Prisma + PostgreSQL', done: true },
      { title: 'Build CRUD API', done: false },
      { title: 'Build the frontend', done: false },
    ],
  });

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
