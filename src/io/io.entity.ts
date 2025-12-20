import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('t_iohistory')
export class IoHistory {
  @PrimaryGeneratedColumn()
  history_id: number;

  @Column({ type: 'date' })
  io_date: string;

  @Column({ length: 2 })
  io_type: string; // IN / OUT / AD

  @Column({ length: 6 })
  soko_cd: string;

  @Column({ length: 10 })
  hin_cd: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @Column({ nullable: true, length: 20 })
  io_user: string;

  @Column({ type: 'text', nullable: true })
  biko: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updated_at: Date;
}
