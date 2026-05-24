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
    const user = await this.usersService.findOne(user_id);

    if (user) {
      const isMatch = await bcrypt
        .compare(pass, user.password)
        .catch(() => pass === user.password);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
        const { password, ...result } = user as any;
        return result as AuthenticatedUser;
      }
    }
    return null;
  }

  login(user: AuthenticatedUser) {
    const payload = {
      sub: user.user_id, // JWTの標準的なID保持用
      userid: user.user_id, // アプリケーション用ID
      Tname: user.name, // アプリケーション用表示名
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // ★ これを追加：ALSOKカード認証用のメソッド
  async validateCardUser(card_id: string): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByCardId(card_id);
    if (user) {
      // passwordを分割代入で除外し、残りをAuthenticatedUserとして返す
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as AuthenticatedUser;
    }
    return null;
  }
}
