import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt'; // ★これを追加

@Module({
  imports: [
    UsersModule,
    // ★ JwtModule を登録し、秘密鍵を設定する
    JwtModule.register({
      secret: 'secretKey', // 本番環境では環境変数にすべきですが、まずはこれで動かします
      signOptions: { expiresIn: '60s' }, // 有効期限
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
