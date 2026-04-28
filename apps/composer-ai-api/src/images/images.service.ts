import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RankImagesDto, RankImagesResponse } from '@vadim-codes/composer-ai-contracts';
import { ClipProcessService } from '../clip/clip-process.service.js';
import { ImagePreprocessService } from '../image-preprocess/image-preprocess.service.js';

interface WorkerRankResult {
  results: { key: string; score: number }[];
  meta: unknown;
}

@Injectable()
export class ImagesService {
  constructor(
    private readonly clip: ClipProcessService,
    private readonly preprocess: ImagePreprocessService
  ) {}

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

    let preprocessed: { key: string; data: string }[];
    try {
      preprocessed = await this.preprocess.prepare(dto.images);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith('IMAGE_FETCH_FAILED')) {
        throw new UnprocessableEntityException({ code: 'IMAGE_FETCH_FAILED', message: msg });
      }
      throw new InternalServerErrorException({ code: 'INTERNAL_ERROR' });
    }

    const keyToUrl = new Map(preprocessed.map((p, i) => [p.key, dto.images[i]]));

    let workerResult: WorkerRankResult;
    try {
      workerResult = await this.clip.send<WorkerRankResult>('rank', {
        prompt: dto.prompt,
        images: preprocessed,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === 'CLIP worker is not ready' || msg === 'CLIP worker exited') {
        throw new ServiceUnavailableException({ code: 'CLIP_WORKER_UNAVAILABLE' });
      }
      throw new InternalServerErrorException({ code: 'INTERNAL_ERROR' });
    }

    return {
      results: workerResult.results.map(({ key, score }) => ({
        url: keyToUrl.get(key) ?? key,
        score,
      })),
    };
  }
}
