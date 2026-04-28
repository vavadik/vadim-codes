import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUser(userId: string): Promise<void> {
    // Reset expiry timer on owned snippets before the cascade nullifies userId
    await this.prisma.db.snippet.updateMany({
      where: { userId },
      data: { lastViewedAt: new Date() },
    });

    // Cascade: OAuthAccounts deleted, Snippet.userId set to null
    await this.prisma.db.user.delete({ where: { id: userId } });
  }
}
