import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { ImagesModule } from './images/images.module';
import { PrismaModule } from './prisma/prisma.module';
import { SalesforceModule } from './salesforce/salesforce.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['.env', '../../.env'], isGlobal: true }),
    PrismaModule,
    TodoModule,
    AuthModule,
    SalesforceModule,
    ImagesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
