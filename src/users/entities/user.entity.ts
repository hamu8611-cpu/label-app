// user.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('m_user')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  user_id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 6 })
  create_id: string;

  @CreateDateColumn({ type: 'timestamptz', precision: 6 })
  created_at: Date;

  @Column({ type: 'varchar', length: 6 })
  update_id: string;

  @UpdateDateColumn({ type: 'timestamptz', precision: 6 })
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  delete_flg: boolean;
}
