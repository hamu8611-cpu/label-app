import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Soko } from './soko.entity';
import { SokoMasterService } from './soko-master.service';
import { SokoMasterController } from './soko-master.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Soko])],
  controllers: [SokoMasterController],
  providers: [SokoMasterService],
  exports: [SokoMasterService],
})
export class SokoMasterModule {}
