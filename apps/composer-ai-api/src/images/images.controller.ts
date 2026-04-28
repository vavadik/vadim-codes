import { Controller, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contract } from '@vadim-codes/composer-ai-contracts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImagesService } from './images.service';

@Controller()
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @TsRestHandler(contract.images.health)
  health() {
    return tsRestHandler(contract.images.health, async () => {
      const ok = await this.imagesService.health();
      if (ok) {
        return {
          status: 200 as const,
          body: { status: 'ok' as const, clip_worker: 'ok' as const },
        };
      }
      return {
        status: 503 as const,
        body: { status: 'degraded' as const, clip_worker: 'unavailable' as const },
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @TsRestHandler(contract.images.rank)
  rank() {
    return tsRestHandler(contract.images.rank, async ({ body }) => {
      const results = await this.imagesService.rank(body);
      return { status: 200 as const, body: results };
    });
  }
}
