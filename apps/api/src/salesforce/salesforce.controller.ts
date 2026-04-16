import { Controller, Req, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contract } from '@composer-ai/contracts';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalesforceService } from './salesforce.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SalesforceController {
  constructor(private readonly sfService: SalesforceService) {}

  @TsRestHandler(contract.salesforce.sobjects)
  sobjects(@Req() req: Request) {
    return tsRestHandler(contract.salesforce.sobjects, async () => {
      const result = await this.sfService.describeGlobal(req.user!.sub);
      return { status: 200 as const, body: result };
    });
  }

  @TsRestHandler(contract.salesforce.describe)
  describe(@Req() req: Request) {
    return tsRestHandler(contract.salesforce.describe, async ({ params }) => {
      try {
        const result = await this.sfService.describe(req.user!.sub, params.name);
        return { status: 200 as const, body: result };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Not found';
        return { status: 404 as const, body: { message } };
      }
    });
  }

  @TsRestHandler(contract.salesforce.getRecord)
  getRecord(@Req() req: Request) {
    return tsRestHandler(contract.salesforce.getRecord, async ({ params }) => {
      try {
        const result = await this.sfService.getRecord(req.user!.sub, params.name, params.id);
        return { status: 200 as const, body: result };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Not found';
        return { status: 404 as const, body: { message } };
      }
    });
  }
}
