import { Controller, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventorySearchDto } from './inventory-search.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly invService: InventoryService) {}

  @Post('search')
  search(@Body() dto: InventorySearchDto) {
    return this.invService.search(dto);
  }
}
