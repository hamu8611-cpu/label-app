// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// ★ TypeScriptのエラーを消すための型定義
interface RequestWithUser {
  user: {
    userid: string;
    Tname: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.user_id,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException(
        'ユーザーIDまたはパスワードが正しくありません',
      );
    }
    return this.authService.login(user);
  }

  @Post('card-login')
  async cardLogin(@Body() body: { card_id: string }) {
    const user = await this.authService.validateCardUser(body.card_id);
    if (!user) {
      throw new UnauthorizedException('このカードは登録されていません');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: unknown) {
    // ★ any を unknown に変更して安全にキャスト
    const authenticatedReq = req as RequestWithUser;

    // ★ フロントエンドがどの名前(キー)を欲しがっていても100%名前が届くように全て返します
    return {
      user_id: authenticatedReq.user.userid,
      name: authenticatedReq.user.Tname,
      userid: authenticatedReq.user.userid,
      Tname: authenticatedReq.user.Tname,
    };
  }
}
