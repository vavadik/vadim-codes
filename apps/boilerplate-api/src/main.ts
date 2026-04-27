import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { generateOpenApiDocument } from '@vadim-codes/boilerplate-contracts';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const document = await generateOpenApiDocument();
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.BOILERPLATE_API_PORT ?? 3001);
}
bootstrap();
