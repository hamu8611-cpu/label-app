import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventorySearchDto } from './inventory-search.dto';

@Controller('inventory')
export class InventoryController {
  // コンストラクタを invService で統一
  constructor(private readonly invService: InventoryService) {}

  // ⭕ 1つ目の窓口：GET /inventory（全件取得）
  @Get()
  async findAll() {
    return this.invService.findAll();
  }

  // ⭕ 2つ目の窓口：POST /inventory/search（条件検索）
  @Post('search')
  search(@Body() dto: InventorySearchDto) {
    return this.invService.search(dto);
  }
}
