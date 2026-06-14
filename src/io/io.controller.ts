import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { IoService } from './io.service';
import { IoRegisterDto } from './dto/io-register.dto';

@Controller('io')
export class IoController {
  constructor(private readonly ioService: IoService) {}

  @Post()
  register(@Body() dto: IoRegisterDto) {
    return this.ioService.register(dto);
  }

  @Get()
  findAll() {
    return this.ioService.findAll();
  }
  /**
   * ✨ 追加：明細の更新 (PATCH /io/:id)
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateDto: {
      control_no?: string;
      quantity?: number;
      biko?: string;
      user_id: string;
    },
  ) {
    return await this.ioService.update(Number(id), updateDto);
  }

  /**
   * ✨ 追加：明細の論理削除 (DELETE /io/:id)
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Body() body: { user_id: string }) {
    return await this.ioService.remove(Number(id), body.user_id);
  }
}
