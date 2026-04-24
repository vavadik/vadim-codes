import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SalesforceController } from './salesforce.controller';
import { SalesforceService } from './salesforce.service';

@Module({
  imports: [AuthModule],
  controllers: [SalesforceController],
  providers: [SalesforceService],
})
export class SalesforceModule {}
