import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RankImagesDto, RankImagesResponse } from '@vadim-codes/composer-ai-contracts';
import { ClipProcessService } from '../clip/clip-process.service';

interface WorkerRankResult {
  results: { url: string; score: number }[];
  meta: unknown;
}

@Injectable()
export class ImagesService {
  constructor(private readonly clip: ClipProcessService) {}

  async health(): Promise<boolean> {
    if (!this.clip.isReady) {
      return false;
    }
    try {
      await this.clip.send('health');
      return true;
    } catch {
      return false;
    }
  }

  async rank(dto: RankImagesDto): Promise<RankImagesResponse> {
    if (!this.clip.isReady) {
      throw new ServiceUnavailableException({ code: 'CLIP_WORKER_UNAVAILABLE' });
    }

    let workerResult: WorkerRankResult;
    try {
      workerResult = await this.clip.send<WorkerRankResult>('rank', {
        prompt: dto.prompt,
        images: dto.images,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith('IMAGE_FETCH_FAILED')) {
        throw new UnprocessableEntityException({ code: 'IMAGE_FETCH_FAILED', message: msg });
      }
      if (msg === 'CLIP worker is not ready' || msg === 'CLIP worker exited') {
        throw new ServiceUnavailableException({ code: 'CLIP_WORKER_UNAVAILABLE' });
      }
      throw new InternalServerErrorException({ code: 'INTERNAL_ERROR' });
    }

    return { results: workerResult.results };
  }
}
