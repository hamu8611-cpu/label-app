import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto'; // パスを修正

export class UpdateUserDto extends PartialType(CreateUserDto) {} // exportを追加
