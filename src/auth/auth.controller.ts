import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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
}
