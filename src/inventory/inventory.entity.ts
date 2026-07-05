// inventory.entity.ts の修正イメージ
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('t_inventory')
export class Inventory {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  soko_cd!: string;

  @PrimaryColumn({ type: 'varchar', length: 10 })
  hin_cd!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  stock!: number;

  // ✨ 追加：作成者ID
  @Column({ type: 'varchar', nullable: true })
  create_id?: string;

  // 💡 変更：with time zone に合わせて型定義を管理
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  // ✨ 追加：更新者ID
  @Column({ type: 'varchar', nullable: true })
  update_id?: string;

  // 💡 変更：with time zone に合わせて型定義を管理
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  // ✨ 追加：論理削除フラグ
  @Column({ type: 'boolean', default: false })
  delete_flg!: boolean;
}
