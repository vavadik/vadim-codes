import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Connection } from 'jsforce';
import type {
  SfDescribeGlobal,
  SfImageAttachment,
  SfImageSearchResponse,
  SfRecord,
  SfSObjectDescribe,
} from '@vadim-codes/composer-ai-contracts';
import { ClipProcessService } from '../clip/clip-process.service';
import { ImagePreprocessService } from '../image-preprocess/image-preprocess.service';
import { PrismaService } from '../prisma/prisma.service';

type SfSession = { sfAccessToken: string; sfInstanceUrl: string };
type AttachmentRow = { Id: string; Name: string; ContentType: string; BodyLength: number };
type WorkerRankResult = { results: { key: string; score: number }[] };

@Injectable()
export class SalesforceService {
  private readonly logger = new Logger(SalesforceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clip: ClipProcessService,
    private readonly imagePreprocess: ImagePreprocessService
  ) {}

  private async getSession(sfUserId: string): Promise<SfSession> {
    const session = await this.prisma.db.session.findFirst({ where: { sfUserId } });
    if (!session) {
      throw new NotFoundException('No active Salesforce session');
    }
    return session;
  }

  private async getConnection(sfUserId: string): Promise<Connection> {
    const session = await this.getSession(sfUserId);
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

  async getImageAttachments(sfUserId: string, parentId: string): Promise<SfImageAttachment[]> {
    const conn = await this.getConnection(sfUserId);
    const escapedId = parentId.replace(/'/g, "\\'");
    const result = await conn.query<AttachmentRow>(
      `SELECT Id, Name, ContentType, BodyLength FROM Attachment WHERE ParentId = '${escapedId}' AND ContentType LIKE 'image/%' ORDER BY LastModifiedDate DESC LIMIT 50`
    );
    return result.records.map((r) => ({
      id: r.Id,
      name: r.Name,
      contentType: r.ContentType,
      bodyLength: r.BodyLength,
    }));
  }

  async getAttachmentBody(
    sfUserId: string,
    attachmentId: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const cached = await this.imagePreprocess.getFromCache(attachmentId);
    if (cached) {
      this.logger.log(`getAttachmentBody: cache hit for ${attachmentId}`);
      return { buffer: cached, contentType: 'image/jpeg' };
    }

    this.logger.log(
      `getAttachmentBody: cache miss for ${attachmentId} — downloading from Salesforce`
    );
    const session = await this.getSession(sfUserId);
    const url = `${session.sfInstanceUrl}/services/data/v60.0/sobjects/Attachment/${attachmentId}/Body`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${session.sfAccessToken}` },
    });
    if (!response.ok) {
      throw new NotFoundException(`Attachment body not found: ${response.status}`);
    }
    const rawBuffer = Buffer.from(await response.arrayBuffer());
    const { data } = await this.imagePreprocess.prepareBuffer(attachmentId, async () => rawBuffer);
    this.logger.log(`getAttachmentBody: preprocessed and cached ${attachmentId}`);
    return { buffer: Buffer.from(data, 'base64'), contentType: 'image/jpeg' };
  }

  async searchImages(
    sfUserId: string,
    parentId: string,
    prompt: string
  ): Promise<SfImageSearchResponse> {
    if (!this.clip.isReady) {
      throw new ServiceUnavailableException('CLIP worker not available');
    }

    this.logger.log(`searchImages: parentId=${parentId} prompt="${prompt}"`);

    const attachments = await this.getImageAttachments(sfUserId, parentId);
    this.logger.log(`searchImages: found ${attachments.length} image attachment(s)`);

    if (attachments.length === 0) {
      return { results: [] };
    }

    const session = await this.getSession(sfUserId);

    const prepared = (
      await Promise.all(
        attachments.map((att) =>
          this.imagePreprocess
            .prepareBuffer(att.id, async () => {
              const url = `${session.sfInstanceUrl}/services/data/v60.0/sobjects/Attachment/${att.id}/Body`;
              const response = await fetch(url, {
                headers: { Authorization: `Bearer ${session.sfAccessToken}` },
              });
              if (!response.ok) {
                throw new Error(`Failed to download attachment ${att.id}: ${response.status}`);
              }
              return Buffer.from(await response.arrayBuffer());
            })
            .catch((err: unknown) => {
              this.logger.warn(
                `searchImages: skipping attachment ${att.id} — ${err instanceof Error ? err.message : String(err)}`
              );
              return null;
            })
        )
      )
    ).filter((p): p is { key: string; data: string } => p !== null);

    this.logger.log(
      `searchImages: ${prepared.length}/${attachments.length} attachment(s) ready for ranking`
    );

    if (prepared.length === 0) {
      return { results: [] };
    }

    this.logger.log(`searchImages: sending ${prepared.length} image(s) to CLIP worker`);
    const workerResult = await this.clip.send<WorkerRankResult>('rank', {
      prompt,
      images: prepared,
    });

    const attById = new Map(attachments.map((a) => [a.id, a]));
    const results = workerResult.results.slice(0, 3).flatMap(({ key, score }) => {
      const att = attById.get(key);
      return att ? [{ id: att.id, name: att.name, score }] : [];
    });

    this.logger.log(
      `searchImages: returning ${results.length} result(s) — top score: ${results[0]?.score.toFixed(3) ?? 'n/a'}`
    );

    return { results };
  }
}
