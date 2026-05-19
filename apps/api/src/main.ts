import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { isAbsolute, resolve } from 'node:path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });
  const uploadsDir = config.get<string>('LOCAL_UPLOADS_DIR') ?? './uploads';
  const uploadsRoot = isAbsolute(uploadsDir)
    ? uploadsDir
    : resolve(process.cwd(), uploadsDir);
  app.useStaticAssets(uploadsRoot, { prefix: '/uploads/' });

  const port = process.env.API_PORT || 8080;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
