import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contract } from '@composer-ai/contracts';

@Controller()
export class HealthController {
  @TsRestHandler(contract.health)
  health() {
    return tsRestHandler(contract.health, async () => {
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
