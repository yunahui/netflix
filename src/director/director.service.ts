import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Director } from './entity/director.entity';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  async create(createDirectorDto: CreateDirectorDto) {
    const createdDirector =
      await this.directorRepository.save(createDirectorDto);

    return this.directorRepository.findOneBy({ id: createdDirector.id });
  }

  findAll() {
    return this.directorRepository.find();
  }

  async findOne(id: number) {
    const director = await this.directorRepository.findOneBy({ id });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
    }

    return director;
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.directorRepository.findOneBy({ id });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
    }

    await this.directorRepository.update(id, updateDirectorDto);

    return this.directorRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const director = await this.directorRepository.findOneBy({ id });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
    }

    await this.directorRepository.delete(id);

    return id;
  }
}
