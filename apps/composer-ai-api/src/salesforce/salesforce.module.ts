import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClipModule } from '../clip/clip.module';
import { ImagePreprocessModule } from '../image-preprocess/image-preprocess.module';
import { SalesforceController } from './salesforce.controller';
import { SalesforceService } from './salesforce.service';

@Module({
  imports: [AuthModule, ClipModule, ImagePreprocessModule],
  controllers: [SalesforceController],
  providers: [SalesforceService],
})
export class SalesforceModule {}
