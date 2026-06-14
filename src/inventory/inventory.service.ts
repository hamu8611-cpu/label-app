import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventorySearchDto } from './inventory-search.dto';
import { InventoryResultDto } from './inventory-result.dto';
import { Soko } from '../soko-master/soko.entity';
import { Hin } from '../hin/hin.entity';
import { IoHistory } from '../io/entities/iohistory.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(Soko)
    private readonly sokoRepo: Repository<Soko>,

    @InjectRepository(Hin)
    private readonly hinRepo: Repository<Hin>,

    @InjectRepository(IoHistory)
    private readonly ioHistoryRepo: Repository<IoHistory>,
  ) {}
  /**
   * 入出庫履歴の一覧取得（担当者名付き）
   */
  async getIoHistoryWithUserName() {
    // QueryBuilderを生成（t_iohistory が基点）
    const qb = this.ioHistoryRepo
      .createQueryBuilder('io')
      // 担当者マスタを左結合し、'io.user' プロパティにマッピングする
      .leftJoinAndMapOne(
        'io.user', // エンティティオブジェクト内にネストさせるプロパティ名
        User, // 担当者マスタのエンティティクラス
        'u', // エイリアス名
        'io.io_user = u.user_id', // 結合条件（io_user と user_id を紐付け）
      );

    // 実行してエンティティを取得
    const histories = await qb.getMany();

    return histories;
  }
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
      qb.andWhere('hin.hin_cd = :hin_cd', { hin_cd: dto.hin_cd });
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
