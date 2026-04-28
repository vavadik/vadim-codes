import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contract } from '@vadim-codes/composer-ai-contracts';
import type { Request, Response } from 'express';
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

  @TsRestHandler(contract.salesforce.getImageAttachments)
  getImageAttachments(@Req() req: Request) {
    return tsRestHandler(contract.salesforce.getImageAttachments, async ({ params }) => {
      try {
        const result = await this.sfService.getImageAttachments(req.user!.sub, params.id);
        return { status: 200 as const, body: result };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Not found';
        return { status: 404 as const, body: { message } };
      }
    });
  }

  @TsRestHandler(contract.salesforce.searchImages)
  searchImages(@Req() req: Request) {
    return tsRestHandler(contract.salesforce.searchImages, async ({ params, body }) => {
      try {
        const result = await this.sfService.searchImages(req.user!.sub, params.id, body.prompt);
        return { status: 200 as const, body: result };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Search failed';
        return { status: 404 as const, body: { message } };
      }
    });
  }

  @Get('/salesforce/attachments/:id/body')
  async getAttachmentBody(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const { buffer, contentType } = await this.sfService.getAttachmentBody(req.user!.sub, id);
    res.setHeader('Content-Type', contentType);
    res.send(buffer);
  }
}
