import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createPrismaClient, PrismaClient } from '@vadim-codes/boilerplate-db';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    const baseUrl = process.env['DATABASE_URL'];
    const dbName = process.env['BOILERPLATE_DB_NAME'];
    if (!baseUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    if (!dbName) {
      throw new Error('BOILERPLATE_DB_NAME is not set');
    }
    this.client = createPrismaClient(`${baseUrl}/${dbName}`);
  }

  get db(): PrismaClient {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
