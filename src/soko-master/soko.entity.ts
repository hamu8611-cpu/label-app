import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('m_soko')
export class Soko {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  soko_cd: string;

  @Column({ type: 'varchar', length: 40 })
  soko_name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
