// io.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoController } from './io.controller';
import { IoService } from './io.service';
import { IoHistory } from './entities/iohistory.entity';
import { Inventory } from '../inventory/inventory.entity'; // 追加

@Module({
  // IoHistory だけでなく Inventory も追加する
  imports: [TypeOrmModule.forFeature([IoHistory, Inventory])],
  controllers: [IoController],
  providers: [IoService],
  exports: [IoService],
})
export class IoModule {}
