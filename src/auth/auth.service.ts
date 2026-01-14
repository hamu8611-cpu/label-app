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
    const payload = { username: user.user_id, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
