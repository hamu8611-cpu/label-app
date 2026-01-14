import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ★ ValidationPipe を有効化（class-validator が動く）★
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO に存在しないプロパティを除去
      forbidNonWhitelisted: false, // 不要なら true にしてもよい
      transform: true, // DTO を自動変換
    }),
  );

  // ★ CORS 設定 ★
  app.enableCors({
    // origin を 'http://localhost:3000' から変更
    origin: '*', // すべての接続元を許可する（開発時のみ）
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}

void (async () => {
  await bootstrap();
})();
