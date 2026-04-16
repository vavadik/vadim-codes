import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection } from 'jsforce';
import type { SfDescribeGlobal, SfRecord, SfSObjectDescribe } from '@composer-ai/contracts';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesforceService {
  constructor(private readonly prisma: PrismaService) {}

  private async getConnection(sfUserId: string): Promise<Connection> {
    const session = await this.prisma.db.session.findFirst({
      where: { sfUserId },
    });

    if (!session) {
      throw new NotFoundException('No active Salesforce session');
    }

    return new Connection({
      accessToken: session.sfAccessToken,
      instanceUrl: session.sfInstanceUrl,
    });
  }

  async describeGlobal(sfUserId: string): Promise<SfDescribeGlobal> {
    const conn = await this.getConnection(sfUserId);
    // jsforce uses Optional<T> (T | null | undefined); our DTO uses T | null — compatible at runtime
    return conn.describeGlobal() as unknown as SfDescribeGlobal;
  }

  async describe(sfUserId: string, name: string): Promise<SfSObjectDescribe> {
    const conn = await this.getConnection(sfUserId);
    return conn.describe(name) as unknown as SfSObjectDescribe;
  }

  async getRecord(sfUserId: string, name: string, id: string): Promise<SfRecord> {
    const conn = await this.getConnection(sfUserId);
    return conn.sobject(name).retrieve(id) as unknown as SfRecord;
  }
}
