import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

interface JwtPayload {
  sub: string;
  userid: string; // ★ userid に合わせる
  Tname: string; // ★ Tname に合わせる
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey',
    });
  }

  // ここで返した値が Controller の req.user になります
  validate(payload: JwtPayload) {
    return {
      userid: payload.userid, // ★ payloadの中身から取り出す
      Tname: payload.Tname, // ★ payloadの中身から取り出す
    };
  }
}
