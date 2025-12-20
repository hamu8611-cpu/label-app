import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // ★ これがないと repository が呼べない
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ★ AuthService などから利用する場合 必須
})
export class UsersModule {}
