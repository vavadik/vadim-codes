import { Injectable } from '@nestjs/common';
import { RankImagesDto, RankImagesResponse } from '@vadim-codes/composer-ai-contracts';
import { ClipProcessService } from '../clip/clip-process.service';

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

  async rank(_dto: RankImagesDto): Promise<RankImagesResponse> {
    // stub — CLIP ranking call added in IR-02
    return { results: [] };
  }
}
