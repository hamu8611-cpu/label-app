// src/io/dto/io-register.dto.ts

import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class IoRegisterDto {
  @IsString()
  @IsNotEmpty()
  soko_cd: string;

  @IsString()
  @IsNotEmpty()
  hin_cd: string;

  @IsString()
  @IsNotEmpty()
  io_type: string;

  @IsNumber({}, { message: '数量は数値を指定してください' })
  quantity: number;

  @IsString()
  io_user?: string;

  @IsString()
  biko?: string;
}
