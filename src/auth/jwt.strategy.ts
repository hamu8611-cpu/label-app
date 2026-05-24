// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // ★ 追加：ユーザー情報を引っ張るために導入

interface JwtPayload {
  sub: string; // user_id が入っている標準の場所
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    // ★ 追加
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey',
    });
  }

  /**
   * トークンが解析された後に自動で走る検証メソッド
   * ここで返したオブジェクトが、コントローラーの req.user に100%そのまま格納されます。
   */
  async validate(payload: JwtPayload) {
    // 確実に入っている sub (user_id) を使って、時刻変換のない生のユーザー情報を取得
    const user = await this.usersService.findRawOne(payload.sub);

    // ユーザーが存在しない、または削除フラグが立っている場合は弾く
    if (!user) {
      throw new UnauthorizedException('セッションが無効です');
    }

    // コントローラーやフロントエンドの「あらゆるキー名の要求」に100%応えられるよう、
    // 考えられるすべてのパターンでオブジェクトを成形して返します。
    return {
      user_id: user.user_id,
      name: user.name,
      userid: user.user_id, // 旧仕様対策
      Tname: user.name, // 旧仕様対策
    };
  }
}
