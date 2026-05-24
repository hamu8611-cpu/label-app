import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsEmail,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  // 修正ポイント：o の型を CreateUserDto に指定する
  @IsOptional()
  @ValidateIf((o: CreateUserDto) => o.email !== '' && o.email !== undefined)
  @IsEmail({}, { message: '正しいメールアドレス形式で入力してください' })
  email?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsOptional()
  card_id?: string;
}
