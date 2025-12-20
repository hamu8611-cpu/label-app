import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hin } from './hin.entity';
import { HinController } from './hin.controller';
import { HinService } from './hin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hin])],
  controllers: [HinController],
  providers: [HinService],
  exports: [HinService],
})
export class HinModule {}
