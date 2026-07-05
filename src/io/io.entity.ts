import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('t_iohistory')
export class IoHistory {
  @PrimaryGeneratedColumn()
  history_id: number;

  @Column({ type: 'date' })
  io_date: string;

  @Column({ length: 2 })
  io_type: string; // 入庫：1 / 出庫：2

  @Column({ length: 6 })
  soko_cd: string;

  @Column({ length: 10 })
  hin_cd: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'control_no', length: 20, nullable: true })
  control_no: string;

  @Column({ nullable: true, length: 20 })
  io_user: string;

  @Column({ type: 'text', nullable: true })
  biko: string;

  @Column({ nullable: true, length: 20 })
  create_id: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;

  @Column({ nullable: true, length: 20 })
  update_id: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  delete_flg: boolean;
}
