import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users') // テーブル名を指定
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
