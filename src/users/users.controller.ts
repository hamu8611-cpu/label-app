// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

// ★修正: RequestインターフェースをExpressの型に基づき明確に定義
interface RequestWithUser extends ExpressRequest {
  user: {
    userid: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: any, // キャストが必要なため一時的にany
  ) {
    const userRequest = req as RequestWithUser;
    return this.usersService.create(createUserDto, userRequest.user.userid);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':user_id')
  findOne(@Param('user_id') user_id: string) {
    return this.usersService.findOne(user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':user_id')
  update(
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const userRequest = req as RequestWithUser;
    return this.usersService.update(
      user_id,
      updateUserDto,
      userRequest.user.userid,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':user_id')
  remove(@Param('user_id') user_id: string, @Request() req: any) {
    const userRequest = req as RequestWithUser;
    // 削除もサービス側で論理削除(save)を行うように変更
    return this.usersService.remove(user_id, userRequest.user.userid);
  }
}
