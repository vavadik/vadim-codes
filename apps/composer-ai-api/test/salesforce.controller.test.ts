import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SalesforceController } from 'src/salesforce/salesforce.controller';
import { SalesforceService } from 'src/salesforce/salesforce.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const mockUser = { sub: 'sf-user-1', org: 'sf-org-1', email: 'user@example.com' };
const mockReq = { user: mockUser } as any;

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

describe('SalesforceController', () => {
  let controller: SalesforceController;
  let service: {
    describeGlobal: ReturnType<typeof vi.fn>;
    describe: ReturnType<typeof vi.fn>;
    getRecord: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      describeGlobal: vi.fn().mockResolvedValue(globalDescribeResult),
      describe: vi.fn().mockResolvedValue(sobjectDescribeResult),
      getRecord: vi.fn().mockResolvedValue(recordResult),
    };

    const module = await Test.createTestingModule({
      controllers: [SalesforceController],
      providers: [{ provide: SalesforceService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(SalesforceController);
  });

  describe('sobjects', () => {
    it('returns 200 with the global describe result', async () => {
      const handler = controller.sobjects(mockReq);
      const result = await handler({ headers: {} } as any);

      expect(service.describeGlobal).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toEqual({ status: 200, body: globalDescribeResult });
    });
  });

  describe('describe', () => {
    it('returns 200 with the SObject describe result', async () => {
      const handler = controller.describe(mockReq);
      const result = await handler({ params: { name: 'Account' }, headers: {} } as any);

      expect(service.describe).toHaveBeenCalledWith(mockUser.sub, 'Account');
      expect(result).toEqual({ status: 200, body: sobjectDescribeResult });
    });

    it('returns 404 with a message when the SObject is not found', async () => {
      service.describe.mockRejectedValue(new NotFoundException('INVALID_TYPE'));

      const handler = controller.describe(mockReq);
      const result = await handler({ params: { name: 'Nonexistent__c' }, headers: {} } as any);

      expect(result).toEqual({ status: 404, body: { message: 'INVALID_TYPE' } });
    });

    it('returns 404 with a fallback message for non-Error rejections', async () => {
      service.describe.mockRejectedValue('unexpected string error');

      const handler = controller.describe(mockReq);
      const result = await handler({ params: { name: 'Bad__c' }, headers: {} } as any);

      expect(result).toEqual({ status: 404, body: { message: 'Not found' } });
    });
  });

  describe('getRecord', () => {
    it('returns 200 with the record', async () => {
      const handler = controller.getRecord(mockReq);
      const result = await handler({ params: { name: 'Account', id: 'a001' }, headers: {} } as any);

      expect(service.getRecord).toHaveBeenCalledWith(mockUser.sub, 'Account', 'a001');
      expect(result).toEqual({ status: 200, body: recordResult });
    });

    it('returns 404 with a message when the record is not found', async () => {
      service.getRecord.mockRejectedValue(new Error('NOT_FOUND'));

      const handler = controller.getRecord(mockReq);
      const result = await handler({
        params: { name: 'Account', id: 'bad-id' },
        headers: {},
      } as any);

      expect(result).toEqual({ status: 404, body: { message: 'NOT_FOUND' } });
    });

    it('returns 404 with a fallback message for non-Error rejections', async () => {
      service.getRecord.mockRejectedValue(null);

      const handler = controller.getRecord(mockReq);
      const result = await handler({
        params: { name: 'Account', id: 'bad-id' },
        headers: {},
      } as any);

      expect(result).toEqual({ status: 404, body: { message: 'Not found' } });
    });
  });
});
