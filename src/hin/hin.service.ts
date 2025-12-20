import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hin } from './hin.entity';

@Injectable()
export class HinService {
  constructor(
    @InjectRepository(Hin)
    private readonly repo: Repository<Hin>,
  ) {}

  async findAll() {
    return this.repo.find();
  }
}
