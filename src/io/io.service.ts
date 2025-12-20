import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoHistory } from './entities/iohistory.entity';
import { IoRegisterDto } from './dto/io-register.dto';

@Injectable()
export class IoService {
  constructor(
    @InjectRepository(IoHistory)
    private readonly ioRepo: Repository<IoHistory>,
  ) {}

  async register(dto: IoRegisterDto) {
    const saved = await this.ioRepo.save(dto);
    return { message: 'ok', data: saved };
  }

  async findAll() {
    return this.ioRepo.find({
      order: { history_id: 'DESC' },
    });
  }
}
