import { Injectable } from '@nestjs/common';
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

  // パスワードハッシュ用
  private readonly saltRounds = 10;

  async create(createUserDto: CreateUserDto) {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    // 新しいユーザーを作成
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const updateData: Partial<User> = { ...updateUserDto };

    // パスワード更新のときだけハッシュ化
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(
        updateUserDto.password,
        this.saltRounds,
      );
    }

    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
    return { deleted: true };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }
}
