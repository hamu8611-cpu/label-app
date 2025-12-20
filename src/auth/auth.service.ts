import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(email: string, password: string) {
    // メールからユーザーを取得
    const user = await this.usersService.findByEmail(email);
    console.log('DEBUG user =', user);
    console.log('DEBUG user.password =', user?.password);

    if (!user) {
      throw new UnauthorizedException('ユーザーが存在しません');
    }

    if (!user.password) {
      throw new UnauthorizedException('パスワードが設定されていません');
    }

    // パスワードチェック
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('パスワードが違います');
    }

    // ログイン成功
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
