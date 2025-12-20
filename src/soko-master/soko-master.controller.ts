import { Controller, Get, Param } from '@nestjs/common';
import { SokoMasterService } from './soko-master.service';

@Controller('soko-master')
export class SokoMasterController {
  constructor(private readonly sokoService: SokoMasterService) {}

  // GET /soko-master
  @Get()
  async findAll() {
    return this.sokoService.findAll();
  }

  // GET /soko-master/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sokoService.findOne(id);
  }
}
