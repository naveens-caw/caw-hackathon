import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import type { AppEnv } from './env.js';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService<AppEnv, true>);
  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  const fallbackPort = config.get('API_PORT', { infer: true });
  const port = Number(process.env.PORT ?? fallbackPort);

  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
};

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
