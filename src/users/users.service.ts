// users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private readonly saltRounds = 10;

  /**
   * 表示用：日本時間の文字列に変換
   */
  private formatJST(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // --- 表示用の取得メソッド（日本時間変換あり） ---

  async findAll() {
    const users = await this.usersRepository.find({
      where: { delete_flg: false },
      order: { user_id: 'ASC' },
    });

    return users.map((user) => ({
      ...user,
      created_at: this.formatJST(user.created_at),
      updated_at: this.formatJST(user.updated_at),
    }));
  }

  async findOne(user_id: string) {
    const user = await this.usersRepository.findOne({ where: { user_id } });
    if (!user) return null;

    return {
      ...user,
      created_at: this.formatJST(user.created_at),
      updated_at: this.formatJST(user.updated_at),
    };
  }

  // --- 内部・認証用の取得メソッド（日本時間変換なし・生のEntityを返却） ---

  /**
   * ★追加: AuthService などのログイン処理が内部で利用するためのメソッド
   * パスワードや日付データがそのまま残ったエンティティデータを返します
   */
  async findRawOne(user_id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { user_id, delete_flg: false },
    });
  }

  /**
   * カード認証用のメソッド
   */
  async findByCardId(card_id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { card_id, delete_flg: false },
    });
  }

  // --- 登録・更新・削除処理（QueryBuilderでタイムゾーンを固定化） ---

  async create(createUserDto: CreateUserDto, operatorId: string) {
    const existing = await this.findRawOne(createUserDto.user_id);
    if (existing) {
      throw new ConflictException('このユーザーIDは既に登録されています');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    await this.usersRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        user_id: createUserDto.user_id,
        name: createUserDto.name,
        email: createUserDto.email || null,
        card_id: createUserDto.card_id || null,
        password: hashedPassword,
        create_id: operatorId,
        update_id: operatorId,
        delete_flg: false,
        created_at: () => "CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo'",
        updated_at: () => "CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo'",
      })
      .execute();

    return this.findOne(createUserDto.user_id);
  }

  async update(
    user_id: string,
    updateUserDto: UpdateUserDto,
    operatorId: string,
  ) {
    const user = await this.findRawOne(user_id);
    if (!user) throw new Error('User not found');

    let hashedPassword = user.password;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(
        updateUserDto.password,
        this.saltRounds,
      );
    }

    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        name: updateUserDto.name ?? user.name,
        email: updateUserDto.email ?? user.email,
        card_id: updateUserDto.card_id ?? user.card_id,
        password: hashedPassword,
        update_id: operatorId,
        updated_at: () => "CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo'",
      })
      .where('user_id = :id', { id: user_id })
      .execute();

    return this.findOne(user_id);
  }

  async remove(user_id: string, operatorId: string) {
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        delete_flg: true,
        update_id: operatorId,
        updated_at: () => "CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo'",
      })
      .where('user_id = :id', { id: user_id })
      .execute();

    return { success: true };
  }
}
