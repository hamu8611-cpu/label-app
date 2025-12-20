// inventory-search.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class InventorySearchDto {
  @IsOptional()
  @IsString()
  soko_cd?: string;

  @IsOptional()
  @IsString()
  hin_cd?: string;

  @IsOptional()
  @IsString()
  hin_name?: string;

  @IsOptional()
  @IsString()
  model_no?: string;
}
