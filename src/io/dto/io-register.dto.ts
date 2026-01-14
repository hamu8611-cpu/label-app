import { IsString, IsNumber, IsOptional } from 'class-validator';

export class IoRegisterDto {
  @IsString()
  io_type: string; // IN / OUT

  @IsString()
  io_date: string; //

  @IsString()
  soko_cd: string; //

  @IsString()
  hin_cd: string; //

  @IsString()
  @IsOptional() // 管理番号は空でもOKにする
  control_no?: string;

  @IsNumber()
  quantity: number; //

  @IsOptional()
  @IsString()
  biko?: string; //

  @IsString()
  io_user: string; //
}
