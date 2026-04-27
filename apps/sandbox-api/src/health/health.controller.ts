import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contract } from '@vadim-codes/sandbox-contracts';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @TsRestHandler(contract.health)
  health() {
    return tsRestHandler(contract.health, async () => {
      await this.prisma.db.$queryRaw`SELECT 1`;
      return {
        status: 200 as const,
        body: {
          status: 'ok',
          timestamp: new Date().toISOString(),
        },
      };
    });
  }
}
