import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialTypeを使うことで、CreateUserDtoの全項目を「任意」として継承します
export class UpdateUserDto extends PartialType(CreateUserDto) {}
