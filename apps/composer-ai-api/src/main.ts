import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { generateOpenApiDocument } from '@vadim-codes/composer-ai-contracts';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const document = await generateOpenApiDocument();
  document.servers = [{ url: '/api' }];
  SwaggerModule.setup('api/swagger', app, document, {
    jsonDocumentUrl: 'api/swagger.json',
  });

  await app.listen(process.env.COMPOSER_AI_API_PORT ?? 3000);
}
bootstrap();
