import { Injectable, NotFoundException } from '@nestjs/common';
import type { SnippetCreated, SnippetDto } from '@vadim-codes/sandbox-contracts';
import { PrismaService } from '../prisma/prisma.service';
import { generateId } from '../shared/generate-id';

@Injectable()
export class SnippetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(code: string, userId: string | undefined): Promise<SnippetCreated> {
    const id = generateId();
    await this.prisma.db.snippet.create({
      data: { id, code, userId: userId ?? null },
    });
    return { id, url: `/s/${id}` };
  }

  async findById(id: string): Promise<SnippetDto> {
    const snippet = await this.prisma.db.snippet.findUnique({ where: { id } });
    if (!snippet) {
      throw new NotFoundException('Snippet not found');
    }
    await this.prisma.db.snippet.update({
      where: { id },
      data: { lastViewedAt: new Date() },
    });
    return { id: snippet.id, code: snippet.code, createdAt: snippet.createdAt.toISOString() };
  }
}
