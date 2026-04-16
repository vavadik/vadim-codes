import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/prisma/client';

export { PrismaClient, Prisma } from '../prisma/generated/prisma/client';
export { PrismaPg } from '@prisma/adapter-pg';

export function createPrismaClient(connectionString: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
