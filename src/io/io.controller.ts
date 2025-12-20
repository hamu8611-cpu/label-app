import { Controller, Post, Body, Get } from '@nestjs/common';
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
}
