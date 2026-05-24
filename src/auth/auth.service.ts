// auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface AuthenticatedUser {
  user_id: string;
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    user_id: string,
    pass: string,
  ): Promise<AuthenticatedUser | null> {
    // ★ 修正: findOne から findRawOne に変更して、生のUserオブジェクト(パスワード入り)を取得
    const user = await this.usersService.findRawOne(user_id);

    if (user) {
      const isMatch = await bcrypt
        .compare(pass, user.password)
        .catch(() => pass === user.password);
      if (isMatch) {
        return {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
        } as AuthenticatedUser;
      }
    }
    return null;
  }

  login(user: AuthenticatedUser) {
    const payload = {
      sub: user.user_id,
      userid: user.user_id,
      Tname: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateCardUser(card_id: string): Promise<AuthenticatedUser | null> {
    // ここで UsersService に追加した findByCardId を呼び出す
    const user = await this.usersService.findByCardId(card_id);
    if (user) {
      return {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
      } as AuthenticatedUser;
    }
    return null;
  }
}
