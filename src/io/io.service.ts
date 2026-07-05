// backend/src/io/io.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    // ★ トランザクション制御用に DataSource を追加注入
    //   （NestJS の TypeOrmModule を使っていれば追加のモジュール登録は不要）
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 在庫レコードのカラム名ゆらぎ（stock / stock_qty）を吸収するヘルパー
   */
  private getStockField(inv: Inventory): 'stock' | 'stock_qty' {
    const invObj = inv as unknown as Record<string, unknown>;
    return 'stock' in invObj ? 'stock' : 'stock_qty';
  }

  private getStockValue(inv: Inventory | null): number {
    if (!inv) return 0;
    const invObj = inv as unknown as Record<string, unknown>;
    return Number(invObj.stock ?? invObj.stock_qty ?? 0);
  }

  /**
   * 入出庫の登録 ＋ 在庫テーブル(t_inventory)のリアルタイム自動更新
   *
   * ★修正点
   *  - t_iohistory への INSERT と t_inventory の UPDATE/INSERT を
   *    1つのトランザクションに統一（片方だけ成功する不整合を防止）
   *  - 対象の在庫行に pessimistic_write ロックをかけてから読む。
   *    同一 倉庫×品目 への同時登録があっても、後続トランザクションは
   *    ロックが解放されるまで待機するため read-modify-write が競合しない
   */
  async register(dto: IoRegisterDto) {
    const qtyChange =
      dto.io_type === 'IN' ? Math.abs(dto.quantity) : -Math.abs(dto.quantity);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingInventory = await queryRunner.manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.soko_cd = :soko_cd', { soko_cd: dto.soko_cd })
        .andWhere('inv.hin_cd = :hin_cd', { hin_cd: dto.hin_cd })
        .getOne();

      const currentStock = this.getStockValue(existingInventory);

      // 出庫時の在庫不足チェック（ロック取得後の最新値でチェックするため安全）
      if (dto.io_type === 'OUT' && currentStock + qtyChange < 0) {
        throw new BadRequestException('出庫数量が現在の在庫数を超えています');
      }

      // 1. 入出庫履歴テーブル(t_iohistory)への登録
      const newHistory = queryRunner.manager.create(IoHistory, {
        io_date: dto.io_date,
        io_type: dto.io_type === 'IN' ? '1' : '2',
        soko_cd: dto.soko_cd,
        hin_cd: dto.hin_cd,
        control_no: dto.control_no || undefined,
        quantity: qtyChange,
        io_user: dto.io_user || undefined,
        create_id: dto.io_user || undefined,
        update_id: dto.io_user || undefined,
        biko: dto.biko || '',
        delete_flg: false,
      });
      const savedHistory = await queryRunner.manager.save(newHistory);

      // 2. 在庫テーブル(t_inventory)の同期更新
      if (existingInventory) {
        const stockField = this.getStockField(existingInventory);
        (existingInventory as unknown as Record<string, unknown>)[stockField] =
          currentStock + qtyChange;
        existingInventory.update_id = dto.io_user;
        existingInventory.updated_at = new Date();
        await queryRunner.manager.save(existingInventory);
      } else {
        const newInventory = queryRunner.manager.create(Inventory, {
          soko_cd: dto.soko_cd,
          hin_cd: dto.hin_cd,
          stock: qtyChange,
          create_id: dto.io_user,
          created_at: new Date(),
          update_id: dto.io_user,
          updated_at: new Date(),
        });
        await queryRunner.manager.save(newInventory);
      }

      await queryRunner.commitTransaction();
      return savedHistory;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 棚札用：日付の古い順に履歴を取得し、その時点の累計在庫数を計算して付与
   *
   * ★修正点
   *  - 旧実装は全履歴を通しで累積していたため、倉庫・品目をまたいだ
   *    無意味な balance になっていた。
   *    soko_cd + hin_cd の組み合わせごとに累計を独立して保持するよう修正。
   */
  async findAll(): Promise<IoHistoryResponse[]> {
    const qb = this.ioRepo
      .createQueryBuilder('io')
      .leftJoinAndMapOne('io.user', User, 'u', 'io.io_user = u.user_id')
      .where('io.delete_flg = :deleteFlg', { deleteFlg: false })
      .orderBy('io.io_date', 'ASC')
      .addOrderBy('io.created_at', 'ASC');

    const rows = await qb.getRawAndEntities();

    const results: IoHistoryResponse[] = [];
    // ★ 倉庫×品目ごとに累計を独立して保持するマップ
    const balanceMap = new Map<string, number>();

    for (let i = 0; i < rows.entities.length; i++) {
      const row = rows.entities[i];
      const raw = rows.raw[i] as { u_name: string | null };

      const groupKey = `${row.soko_cd}_${row.hin_cd}`;
      const qty = Number(row.quantity);
      const prevBalance = balanceMap.get(groupKey) ?? 0;
      const newBalance = prevBalance + qty;
      balanceMap.set(groupKey, newBalance);

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
        balance: newBalance,
        user_name: resolvedName,
      });
    }

    return results;
  }

  /**
   * 明細行データの更新処理（管理番号・数量・備考・ユーザーID）
   *
   * ★修正点
   *  - トランザクション化 + 在庫行のロック
   *  - 修正後に在庫がマイナスになる場合は拒否するチェックを追加
   *    （register() にはあったが update() には無かった）
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const history = await queryRunner.manager.findOne(IoHistory, {
        where: { history_id, delete_flg: false },
      });
      if (!history) {
        throw new NotFoundException('指定された履歴データが見つかりません');
      }

      if (
        updateDto.quantity !== undefined &&
        Number(updateDto.quantity) !== Number(history.quantity)
      ) {
        const oldQty = Number(history.quantity);
        const newQty = Number(updateDto.quantity);
        const diff = newQty - oldQty;

        const inv = await queryRunner.manager
          .createQueryBuilder(Inventory, 'inv')
          .setLock('pessimistic_write')
          .where('inv.soko_cd = :soko_cd', { soko_cd: history.soko_cd })
          .andWhere('inv.hin_cd = :hin_cd', { hin_cd: history.hin_cd })
          .getOne();

        if (inv) {
          const stockField = this.getStockField(inv);
          const currentStock = this.getStockValue(inv);
          const nextStock = currentStock + diff;

          // ★ 追加：修正後に在庫がマイナスになる場合は更新を拒否
          if (nextStock < 0) {
            throw new BadRequestException(
              '修正後の数量では在庫数がマイナスになるため更新できません',
            );
          }

          await queryRunner.manager.update(
            Inventory,
            { soko_cd: history.soko_cd, hin_cd: history.hin_cd },
            {
              [stockField]: nextStock,
              update_id: updateDto.user_id,
              updated_at: new Date(),
            },
          );
        }
        history.quantity = newQty;
      }

      if (updateDto.control_no !== undefined)
        history.control_no = updateDto.control_no;
      if (updateDto.biko !== undefined) history.biko = updateDto.biko;

      history.update_id = updateDto.user_id;
      history.io_user = updateDto.user_id;
      history.updated_at = new Date();

      const saved = await queryRunner.manager.save(history);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 明細行データの論理削除処理
   *
   * ★修正点
   *  - トランザクション化 + 在庫行のロックを追加
   */
  async remove(history_id: number, user_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const history = await queryRunner.manager.findOne(IoHistory, {
        where: { history_id, delete_flg: false },
      });
      if (!history) {
        throw new NotFoundException('指定された履歴データが見つかりません');
      }

      const inv = await queryRunner.manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.soko_cd = :soko_cd', { soko_cd: history.soko_cd })
        .andWhere('inv.hin_cd = :hin_cd', { hin_cd: history.hin_cd })
        .getOne();

      if (inv) {
        const stockField = this.getStockField(inv);
        const currentStock = this.getStockValue(inv);
        const nextStock = currentStock - Number(history.quantity);

        // ★ 追加：この履歴を取り消すと在庫がマイナスになる場合は削除を拒否
        //   （例：入庫を後続の出庫が食い潰した後に、その入庫だけを
        //     削除しようとすると整合性が壊れるため防止する）
        if (nextStock < 0) {
          throw new BadRequestException(
            'この履歴を削除すると在庫数がマイナスになるため削除できません（後続の出庫でこの数量が既に消費されている可能性があります）',
          );
        }

        await queryRunner.manager.update(
          Inventory,
          { soko_cd: history.soko_cd, hin_cd: history.hin_cd },
          {
            [stockField]: nextStock,
            update_id: user_id,
            updated_at: new Date(),
          },
        );
      }

      history.delete_flg = true;
      history.update_id = user_id;
      history.updated_at = new Date();

      const saved = await queryRunner.manager.save(history);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
