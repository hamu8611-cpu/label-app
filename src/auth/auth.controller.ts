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

  // ★ 修正：型を { user: { username: string } } と明示して any エラーを回避
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: { userid: string; Tname: string } }) {
    return {
      userid: req.user.userid,
      Tname: req.user.Tname, // ★ tname ではなく Tname
    };
  }
}
