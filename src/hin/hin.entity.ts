import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('m_hin')
export class Hin {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  hin_cd!: string;

  @Column({ type: 'varchar', length: 40 })
  hin_name!: string;

  @Column({ type: 'varchar', length: 100 })
  model_no!: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  soko_cd!: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  location!: string | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
