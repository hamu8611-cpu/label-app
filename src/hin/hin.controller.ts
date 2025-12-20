import { Controller, Get } from '@nestjs/common';
import { HinService } from './hin.service';

@Controller('hin-master')
export class HinController {
  constructor(private readonly service: HinService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }
}
