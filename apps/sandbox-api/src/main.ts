import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { generateOpenApiDocument } from '@vadim-codes/sandbox-contracts';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const document = await generateOpenApiDocument();
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.SANDBOX_API_PORT ?? 3002);
}
bootstrap();
