// backend/src/io/io.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoHistory } from './entities/iohistory.entity';
import { Inventory } from '../inventory/inventory.entity';
import { IoRegisterDto } from './dto/io-register.dto';
import { User } from '../users/entities/user.entity';

export interface IoHistoryResponse extends Omit<IoHistory, 'created_at'> {
  created_at: string;
  balance: number;
  user_name: string;
}

@Injectable()
export class IoService {
  constructor(
    @InjectRepository(IoHistory)
    private readonly ioRepo: Repository<IoHistory>,
    @InjectRepository(Inventory)
    private readonly invRepo: Repository<Inventory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 入出庫の登録 ＋ 在庫テーブル(t_inventory)のリアルタイム自動更新
   */
  async register(dto: IoRegisterDto) {
    // 数量の正負を調整 (入庫はプラス、出庫はマイナス)
    const qtyChange =
      dto.io_type === 'IN' ? Math.abs(dto.quantity) : -Math.abs(dto.quantity);

    // 出庫時の在庫不足チェック
    if (dto.io_type === 'OUT') {
      const inv = await this.invRepo.findOne({
        where: { soko_cd: dto.soko_cd, hin_cd: dto.hin_cd },
      });

      let currentStock = 0;
      if (inv) {
        // ESLint警告回避のため安全なRecordオブジェクトとしてキャストしてプロパティを取得
        const invObj = inv as unknown as Record<string, unknown>;
        currentStock = Number(invObj.stock ?? invObj.stock_qty ?? 0);
      }

      if (currentStock + qtyChange < 0) {
        throw new BadRequestException('出庫数量が現在の在庫数を超えています');
      }
    }

    // 1. 入出庫履歴テーブル(t_iohistory)への登録オブジェクト
    const newHistory = this.ioRepo.create({
      io_date: dto.io_date,
      io_type: dto.io_type === 'IN' ? '1' : '2',
      soko_cd: dto.soko_cd,
      hin_cd: dto.hin_cd,
      control_no: dto.control_no || undefined,
      quantity: qtyChange,
      io_user: dto.io_user || undefined,
      create_id: dto.io_user || undefined, // ★ create_idの同期
      update_id: dto.io_user || undefined, // ★ update_idの同期
      biko: dto.biko || '',
      delete_flg: false,
    });
    const savedHistory = await this.ioRepo.save(newHistory);

    // 2. 在庫テーブル(t_inventory)の同期更新処理
    const existingInventory = await this.invRepo.findOne({
      where: { soko_cd: dto.soko_cd, hin_cd: dto.hin_cd },
    });

    if (existingInventory) {
      const invObj = existingInventory as unknown as Record<string, unknown>;
      const stockField = 'stock' in invObj ? 'stock' : 'stock_qty';
      const currentVal = Number(invObj[stockField] ?? 0);

      await this.invRepo.update(
        { soko_cd: dto.soko_cd, hin_cd: dto.hin_cd },
        { [stockField]: currentVal + qtyChange },
      );
    } else {
      const hasStockField =
        this.invRepo.metadata.findColumnWithPropertyName('stock');
      const stockField = hasStockField ? 'stock' : 'stock_qty';

      const newInventory = this.invRepo.create({
        soko_cd: dto.soko_cd,
        hin_cd: dto.hin_cd,
        [stockField]: qtyChange,
      });
      await this.invRepo.save(newInventory);
    }

    return savedHistory;
  }

  /**
   * 棚札用：日付の古い順に履歴を取得し、右側にその時点の累計在庫数を計算して付与
   */
  async findAll(): Promise<IoHistoryResponse[]> {
    const qb = this.ioRepo
      .createQueryBuilder('io')
      .leftJoinAndMapOne('io.user', User, 'u', 'io.io_user = u.user_id')
      // ★ 修正：論理削除フラグが false（未削除）のデータのみに絞り込む
      .where('io.delete_flg = :deleteFlg', { deleteFlg: false })
      .orderBy('io.io_date', 'ASC')
      .addOrderBy('io.created_at', 'ASC');

    const rows = await qb.getRawAndEntities();

    const results: IoHistoryResponse[] = [];
    let currentAccumulatedStock = 0;

    for (let i = 0; i < rows.entities.length; i++) {
      const row = rows.entities[i];
      const raw = rows.raw[i] as { u_name: string | null };

      const qty = Number(row.quantity);
      currentAccumulatedStock += qty;

      const jstDateString = new Date(row.created_at).toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      const userProperty = (row as Record<string, any>).user as
        | { name?: string }
        | undefined;

      const currentRaw = raw as { u_name?: string | null };

      const resolvedName: string = String(
        userProperty?.name ??
          currentRaw.u_name ??
          row.io_user ??
          '不明なユーザー',
      );

      results.push({
        ...row,
        biko: row.biko || '',
        created_at: jstDateString,
        balance: currentAccumulatedStock,
        user_name: resolvedName,
      });
    }

    return results;
  }

  /**
   * ✨ 追加：明細行データの更新処理（管理番号・数量・備考・ユーザーID）
   */
  async update(
    history_id: number,
    updateDto: {
      control_no?: string;
      quantity?: number;
      biko?: string;
      user_id: string;
    },
  ) {
    const history = await this.ioRepo.findOne({
      where: { history_id, delete_flg: false },
    });
    if (!history) {
      throw new NotFoundException('指定された履歴データが見つかりません');
    }

    // 数量の変更がある場合は、t_inventory(在庫マスタ)の差分を補正
    if (
      updateDto.quantity !== undefined &&
      Number(updateDto.quantity) !== Number(history.quantity)
    ) {
      const oldQty = Number(history.quantity);
      const newQty = Number(updateDto.quantity);
      const diff = newQty - oldQty; // 在庫テーブルに加算すべき差分

      const inv = await this.invRepo.findOne({
        where: { soko_cd: history.soko_cd, hin_cd: history.hin_cd },
      });
      if (inv) {
        const invObj = inv as unknown as Record<string, unknown>;
        const stockField = 'stock' in invObj ? 'stock' : 'stock_qty';
        const currentStock = Number(invObj[stockField] ?? 0);

        await this.invRepo.update(
          { soko_cd: history.soko_cd, hin_cd: history.hin_cd },
          { [stockField]: currentStock + diff },
        );
      }
      history.quantity = newQty;
    }

    if (updateDto.control_no !== undefined)
      history.control_no = updateDto.control_no;
    if (updateDto.biko !== undefined) history.biko = updateDto.biko;

    // 更新者情報とタイムスタンプの更新
    history.update_id = updateDto.user_id; // ★ update_idをセット
    history.io_user = updateDto.user_id;
    history.updated_at = new Date();

    return await this.ioRepo.save(history);
  }

  /**
   * ✨ 追加：明細行データの論理削除処理
   */
  async remove(history_id: number, user_id: string) {
    const history = await this.ioRepo.findOne({
      where: { history_id, delete_flg: false },
    });
    if (!history) {
      throw new NotFoundException('指定された履歴データが見つかりません');
    }

    // 削除される履歴の数量分、t_inventory(在庫マスタ)の数値を元に戻す（相殺）
    const inv = await this.invRepo.findOne({
      where: { soko_cd: history.soko_cd, hin_cd: history.hin_cd },
    });
    if (inv) {
      const invObj = inv as unknown as Record<string, unknown>;
      const stockField = 'stock' in invObj ? 'stock' : 'stock_qty';
      const currentStock = Number(invObj[stockField] ?? 0);

      await this.invRepo.update(
        { soko_cd: history.soko_cd, hin_cd: history.hin_cd },
        { [stockField]: currentStock - Number(history.quantity) },
      );
    }

    // 論理削除ステータスと更新ユーザーの書き込み
    history.delete_flg = true;
    history.update_id = user_id; // ★ update_idをセット
    history.updated_at = new Date();

    return await this.ioRepo.save(history);
  }
}
