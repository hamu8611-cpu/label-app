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

  async create(createUserDto: CreateUserDto) {
    console.log('--- 届いた生データ ---', createUserDto);

    if (!createUserDto.password) {
      throw new Error('パスワードが届いていません');
    }

    const existing = await this.findOne(createUserDto.user_id);
    if (existing) {
      throw new ConflictException('このユーザーIDは既に登録されています');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      create_id: createUserDto.user_id,
      update_id: createUserDto.user_id,
      delete_flg: false,
    });

    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find({ where: { delete_flg: false } });
  }

  async findOne(user_id: string) {
    return this.usersRepository.findOne({ where: { user_id } });
  }

  async update(user_id: string, updateUserDto: UpdateUserDto) {
    const updateData: Partial<User> = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(
        updateUserDto.password,
        this.saltRounds,
      );
    }
    updateData.update_id = user_id;
    await this.usersRepository.update(user_id, updateData);
    return this.findOne(user_id);
  }

  async remove(user_id: string) {
    await this.usersRepository.update(user_id, { delete_flg: true });
    return { deleted: true };
  }
  // ★ これを追加：card_idでユーザーを検索するメソッド
  async findByCardId(card_id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { card_id, delete_flg: false },
    });
  }
}
