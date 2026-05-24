import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // --- HTTPS 証明書の読み込み ---
  const httpsOptions = {
    key: fs.readFileSync(
      path.join(__dirname, '../../frontend/certificates/localhost-key.pem'),
    ),
    cert: fs.readFileSync(
      path.join(__dirname, '../../frontend/certificates/localhost.pem'),
    ),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions, // HTTPS を有効化
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  // 外部接続を許可するために '0.0.0.0' を指定
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on: https://192.168.10.6:${port}`);
}

void (async () => {
  await bootstrap();
})();
