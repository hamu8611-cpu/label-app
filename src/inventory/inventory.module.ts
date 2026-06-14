import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './inventory.entity';
import { Soko } from '../soko-master/soko.entity';
import { Hin } from '../hin/hin.entity';
import { IoHistory } from '../io/entities/iohistory.entity'; // ★ パスは実際の場所に合わせる

@Module({
  imports: [
    // ★ forFeature の中に IoHistory が入っているか確認（これが抜けているとエラーになります）
    TypeOrmModule.forFeature([Inventory, Soko, Hin, IoHistory]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
