import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6) // ユーザーIDは6桁固定
  user_id: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
