import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Soko } from './soko.entity';

@Injectable()
export class SokoMasterService {
  constructor(
    @InjectRepository(Soko)
    private readonly sokoRepo: Repository<Soko>,
  ) {}

  // 全件取得
  findAll(): Promise<Soko[]> {
    return this.sokoRepo.find({
      order: { soko_cd: 'ASC' },
    });
  }

  // 1件取得
  findOne(soko_cd: string): Promise<Soko | null> {
    return this.sokoRepo.findOne({
      where: { soko_cd },
    });
  }
}
