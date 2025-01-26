import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entity/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createGenreDto: CreateGenreDto) {
    const count = await this.genreRepository.count({
      where: { name: createGenreDto.name },
    });

    if (count) {
      throw new BadRequestException('이미 존재하는 장르의 이름입니다!');
    }
    const createdGenre = await this.genreRepository.save(createGenreDto);

    return this.genreRepository.findBy({ id: createdGenre.id });
  }

  findAll() {
    return this.genreRepository.find();
  }

  async findOne(id: number) {
    const genre = await this.genreRepository.findOne({
      where: {
        id,
      },
      relations: ['movies'],
    });

    if (!genre) throw new NotFoundException('존재하지 않는 ID의 장르입니다!');

    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreRepository.findOne({
      where: {
        id,
      },
    });

    if (!genre) {
      throw new NotFoundException('존재하지 않는 ID의 장르입니다!');
    }

    const count = await this.genreRepository.count({
      where: {
        name: updateGenreDto.name,
      },
    });

    if (count) {
      throw new BadRequestException('이미 존재하는 장르의 이름입니다!');
    }

    await this.genreRepository.update(id, updateGenreDto);

    const updatedGenre = await this.genreRepository.findOneBy({ id });

    return updatedGenre;
  }

  async remove(id: number) {
    const genre = await this.genreRepository.findOneBy({ id });

    if (!genre) {
      throw new NotFoundException('존재하지 않는 ID의 장르입니다!');
    }

    return this.genreRepository.delete(id);
  }
}
