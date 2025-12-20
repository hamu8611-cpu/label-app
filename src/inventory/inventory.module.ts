import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inventory } from './inventory.entity';
import { Soko } from '../soko-master/soko.entity';
import { Hin } from '../hin/hin.entity';

import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory, // t_inventory
      Soko, // m_soko
      Hin, // m_hin
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService], // 他サービスでも利用可能
})
export class InventoryModule {}
