import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Connection } from 'jsforce';
import { SalesforceService } from 'src/salesforce/salesforce.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClipProcessService } from 'src/clip/clip-process.service';
import { ImagePreprocessService } from 'src/image-preprocess/image-preprocess.service';

vi.mock('jsforce', () => ({ Connection: vi.fn() }));

const MockConnection = vi.mocked(Connection);

const makeSession = (overrides = {}) => ({
  id: 'session-1',
  sfUserId: 'sf-user-1',
  sfAccessToken: 'sf-access-token',
  sfInstanceUrl: 'https://na1.salesforce.com',
  ...overrides,
});

const globalDescribeResult = {
  encoding: 'UTF-8',
  maxBatchSize: 200,
  sobjects: [{ name: 'Account', label: 'Account', custom: false }],
};

const sobjectDescribeResult = {
  name: 'Account',
  label: 'Account',
  fields: [{ name: 'Id', label: 'Record ID', type: 'id' }],
};

const recordResult = { Id: 'a001', Name: 'Acme Corp' };

describe('SalesforceService', () => {
  let service: SalesforceService;
  let prisma: { db: { session: Record<string, ReturnType<typeof vi.fn>> } };
  let mockConn: {
    describeGlobal: ReturnType<typeof vi.fn>;
    describe: ReturnType<typeof vi.fn>;
    sobject: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockConn = {
      describeGlobal: vi.fn().mockResolvedValue(globalDescribeResult),
      describe: vi.fn().mockResolvedValue(sobjectDescribeResult),
      sobject: vi.fn().mockReturnValue({ retrieve: vi.fn().mockResolvedValue(recordResult) }),
    };
    MockConnection.mockImplementation(
      class {
        describeGlobal = mockConn.describeGlobal;
        describe = mockConn.describe;
        sobject = mockConn.sobject;
      } as unknown as typeof Connection
    );

    prisma = {
      db: {
        session: {
          findFirst: vi.fn().mockResolvedValue(makeSession()),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        SalesforceService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ClipProcessService,
          useValue: { isReady: true, send: vi.fn() },
        },
        {
          provide: ImagePreprocessService,
          useValue: { getFromCache: vi.fn(), prepareBuffer: vi.fn() },
        },
      ],
    }).compile();

    service = module.get(SalesforceService);
  });

  describe('getConnection (via public methods)', () => {
    it('looks up session by sfUserId', async () => {
      await service.describeGlobal('sf-user-1');

      expect(prisma.db.session.findFirst).toHaveBeenCalledWith({
        where: { sfUserId: 'sf-user-1' },
      });
    });

    it('creates a jsforce Connection with the session credentials', async () => {
      const session = makeSession({
        sfAccessToken: 'my-token',
        sfInstanceUrl: 'https://eu5.salesforce.com',
      });
      prisma.db.session.findFirst.mockResolvedValue(session);

      await service.describeGlobal('sf-user-1');

      expect(MockConnection).toHaveBeenCalledWith({
        accessToken: 'my-token',
        instanceUrl: 'https://eu5.salesforce.com',
      });
    });

    it('throws NotFoundException when no session exists', async () => {
      prisma.db.session.findFirst.mockResolvedValue(null);

      await expect(service.describeGlobal('unknown-user')).rejects.toThrow(
        new NotFoundException('No active Salesforce session')
      );
    });
  });

  describe('describeGlobal', () => {
    it('calls conn.describeGlobal() and returns the result', async () => {
      const result = await service.describeGlobal('sf-user-1');

      expect(mockConn.describeGlobal).toHaveBeenCalled();
      expect(result).toEqual(globalDescribeResult);
    });
  });

  describe('describe', () => {
    it('calls conn.describe() with the SObject name and returns the result', async () => {
      const result = await service.describe('sf-user-1', 'Account');

      expect(mockConn.describe).toHaveBeenCalledWith('Account');
      expect(result).toEqual(sobjectDescribeResult);
    });
  });

  describe('getRecord', () => {
    it('calls conn.sobject(name).retrieve(id) and returns the record', async () => {
      const result = await service.getRecord('sf-user-1', 'Account', 'a001');

      expect(mockConn.sobject).toHaveBeenCalledWith('Account');
      expect(
        (mockConn.sobject as unknown as (name: string) => { retrieve: ReturnType<typeof vi.fn> })(
          'Account'
        ).retrieve
      ).toHaveBeenCalledWith('a001');
      expect(result).toEqual(recordResult);
    });

    it('throws NotFoundException when no session exists', async () => {
      prisma.db.session.findFirst.mockResolvedValue(null);

      await expect(service.getRecord('unknown-user', 'Account', 'a001')).rejects.toThrow(
        new NotFoundException('No active Salesforce session')
      );
    });
  });
});
