import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoController } from './io.controller';
import { IoService } from './io.service';
import { IoHistory } from './entities/iohistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IoHistory])],
  controllers: [IoController],
  providers: [IoService],
  exports: [IoService],
})
export class IoModule {}
