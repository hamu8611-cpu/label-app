import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoHistory } from './entities/iohistory.entity';
import { Inventory } from '../inventory/inventory.entity';
import { IoRegisterDto } from './dto/io-register.dto';

// レスポンス用の型定義
export interface IoHistoryResponse extends Omit<IoHistory, 'created_at'> {
  created_at: string;
  balance: number;
}

@Injectable()
export class IoService {
  constructor(
    @InjectRepository(IoHistory)
    private readonly ioRepo: Repository<IoHistory>,
    @InjectRepository(Inventory)
    private readonly invRepo: Repository<Inventory>,
  ) {}

  async register(dto: IoRegisterDto) {
    if (dto.quantity < 0) {
      const result = await this.ioRepo
        .createQueryBuilder('io')
        .select('SUM(io.quantity)', 'sum')
        .where('io.hin_cd = :hin_cd', { hin_cd: dto.hin_cd })
        .andWhere('io.soko_cd = :soko_cd', { soko_cd: dto.soko_cd })
        .getRawOne<{ sum: string | null }>();

      const currentSumStr = result?.sum ?? '0';
      const currentStock = parseFloat(currentSumStr);

      if (currentStock + dto.quantity < 0) {
        throw new BadRequestException(
          `在庫不足です。現在の総在庫は ${currentStock} です。`,
        );
      }
    }
    return await this.ioRepo.save(dto);
  }

  async findAll(): Promise<IoHistoryResponse[]> {
    try {
      // 1. 計算のために「古い順(ASC)」で全履歴を取得
      const histories = await this.ioRepo.find({
        order: { history_id: 'ASC' },
      });

      if (!histories || histories.length === 0) return [];

      const results: IoHistoryResponse[] = [];
      const stockMap = new Map<string, number>();

      for (const row of histories) {
        const key = `${row.soko_cd}-${row.hin_cd}`;
        let displayBiko = row.biko || '';

        // 2. その品目の「最初の1行目」の処理
        if (!stockMap.has(key)) {
          const inv = await this.invRepo.findOne({
            where: { soko_cd: row.soko_cd, hin_cd: row.hin_cd },
          });
          displayBiko = '在庫'; // 1行目の備考を「在庫」に固定
          const initialStock = inv ? Number(inv.stock) : 0;
          stockMap.set(key, initialStock);
        }

        const currentAccumulated = stockMap.get(key) || 0;
        const newBalance = currentAccumulated + Number(row.quantity);
        stockMap.set(key, newBalance);

        // 日本時間(JST)の文字列を作成
        const jstDateString = new Date(row.created_at).toLocaleString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        results.push({
          ...row,
          biko: displayBiko,
          created_at: jstDateString,
          balance: newBalance,
        });
      }

      // --- 並び順の制御 ---
      // 3. 配列の中から「在庫」と書かれた最初の1行目だけを取り出す
      const stockRow = results.find((r) => r.biko === '在庫');
      // 4. それ以外の「入出庫データ」を取り出し、新しい順（降順）に並び替える
      const transactionRows = results
        .filter((r) => r.biko !== '在庫')
        .reverse(); // 古い順(ASC)で入っているので、reverse()で新しい順(DESC)になる

      // 5. [在庫行] + [新しい順の履歴] の順番で結合して返す
      return stockRow ? [stockRow, ...transactionRows] : transactionRows;
    } catch (error) {
      console.error('findAll error:', error);
      return [];
    }
  }
}
