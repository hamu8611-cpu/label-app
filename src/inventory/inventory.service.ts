import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventorySearchDto } from './inventory-search.dto';
import { InventoryResultDto } from './inventory-result.dto';
import { Soko } from '../soko-master/soko.entity';
import { Hin } from '../hin/hin.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(Soko)
    private readonly sokoRepo: Repository<Soko>,

    @InjectRepository(Hin)
    private readonly hinRepo: Repository<Hin>,
  ) {}

  /**
   * 品目マスタ基準の在庫検索
   */
  async search(dto: InventorySearchDto): Promise<InventoryResultDto[]> {
    //console.log('Received DTO:', dto); // ← ここで中身が空でないかチェック
    // QueryBuilder（品目マスタが基点）
    const qb = this.hinRepo
      .createQueryBuilder('hin')
      .leftJoinAndMapOne('hin.soko', Soko, 'soko', 'hin.soko_cd = soko.soko_cd')
      .leftJoinAndMapOne(
        'hin.inventory',
        Inventory,
        'iv',
        'hin.hin_cd = iv.hin_cd',
      );

    // ------------ フィルタ条件 ------------
    if (dto.soko_cd) {
      qb.andWhere('hin.soko_cd = :soko_cd', { soko_cd: dto.soko_cd });
    }

    if (dto.hin_cd) {
      qb.andWhere('hin.hin_cd LIKE :hin_cd', { hin_cd: `%${dto.hin_cd}%` });
    }

    if (dto.hin_name) {
      qb.andWhere('hin.hin_name LIKE :hin_name', {
        hin_name: `%${dto.hin_name}%`,
      });
    }

    if (dto.model_no) {
      qb.andWhere('hin.model_no LIKE :model_no', {
        model_no: `%${dto.model_no}%`,
      });
    }

    qb.orderBy('hin.hin_cd', 'ASC');

    // 実行（raw + entity を取得）
    const rows = await qb.getRawAndEntities();

    // raw の型定義
    type InventoryRaw = {
      hin_soko_cd: string | null;
      soko_soko_name: string | null;
      iv_stock: number | null;
    };

    // ------------ DTO 生成 ------------
    const results: InventoryResultDto[] = rows.entities.map((hin, index) => {
      const raw = rows.raw[index] as InventoryRaw;

      const item: InventoryResultDto = {
        soko_cd: hin.soko_cd ?? '',
        soko_name: raw.soko_soko_name ?? '',
        hin_cd: hin.hin_cd,
        hin_name: hin.hin_name,
        model_no: hin.model_no,
        stock: raw.iv_stock ?? 0,
      };

      return item;
    });

    return results;
  }
}
