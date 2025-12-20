import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('t_inventory')
export class Inventory {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  soko_cd!: string;

  @PrimaryColumn({ type: 'varchar', length: 10 })
  hin_cd!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  stock!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
