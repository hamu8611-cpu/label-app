import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // 追加
import { JwtStrategy } from './jwt.strategy'; // ★ これを追加！

@Module({
  imports: [
    UsersModule,
    PassportModule, // 追加
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' }, // 1時間に延長
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // 本来はここに JwtStrategy が必要です
  exports: [AuthService],
})
export class AuthModule {}
