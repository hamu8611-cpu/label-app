// iohistory.entity.ts (backend\src\io\entities\iohistory.entity.ts)

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('t_iohistory')
export class IoHistory {
  @PrimaryGeneratedColumn()
  history_id: number;

  @Column({ type: 'date' })
  io_date: string;

  @Column({ length: 2 })
  io_type: string;

  @Column({ length: 6 })
  soko_cd: string;

  @Column({ length: 10 })
  hin_cd: string;

  // --- 修正箇所：管理番号カラムを追加 ---
  @Column({ length: 20, nullable: true })
  control_no?: string;
  // ----------------------------------

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @Column({ nullable: true, length: 20 })
  io_user?: string;

  @Column({ type: 'text', nullable: true })
  biko?: string;
  // 💡 追加：作成者ID（カラム名を明示）
  @Column({ name: 'create_id', nullable: true })
  create_id?: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;
  // 💡 追加：更新者ID（カラム名を明示）
  @Column({ name: 'update_id', nullable: true })
  update_id?: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  updated_at: Date;

  // 💡 追加：論理削除フラグ（初期値は false）
  @Column({ name: 'delete_flg', type: 'boolean', default: false })
  delete_flg: boolean;

  // leftJoinAndMapOneの受け皿となるプロパティ（DBのカラムとしては存在しない）
  user?: any;
}
