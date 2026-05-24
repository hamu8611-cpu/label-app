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

  @Column({ type: 'varchar', nullable: true }) // DB側でNULLを許可
  name: string | null; // ★ 修正: 型にも | null を追加

  @Column({ type: 'varchar', nullable: true }) // DB側でNULLを許可
  email: string | null; // ★ 修正: 型にも | null を追加

  @Column({ type: 'varchar' })
  password: string;

  // ★ これを追加：ALSOKカードのシリアル番号
  @Column({ type: 'varchar', nullable: true }) // ★ 修正：type: 'varchar' を追加
  card_id: string | null;

  @Column({ type: 'varchar', length: 6 })
  create_id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'varchar', length: 6 })
  update_id: string;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  delete_flg: boolean;
}
