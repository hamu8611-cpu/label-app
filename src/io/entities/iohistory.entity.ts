import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('t_iohistory')
export class IoHistory {
  @PrimaryGeneratedColumn()
  history_id: number;

  @Column()
  io_date: Date;

  @Column()
  io_type: string;

  @Column()
  soko_cd: string;

  @Column()
  hin_cd: string;

  @Column('numeric')
  quantity: number;

  @Column({ nullable: true })
  io_user?: string;

  @Column({ nullable: true })
  biko?: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updated_at: Date;
}
