import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { MovieDetail } from './entity/movie-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Director } from 'src/director/entity/director.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const director = await this.directorRepository.findOneBy({
      id: createMovieDto.directorId,
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
    }

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        detail: createMovieDto.detail,
      },
      director,
    });

    return movie;
  }

  findAll(title?: string) {
    if (!title) {
      return this.movieRepository.find();
    }

    return this.movieRepository.find({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['director'],
    });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director'],
    });
    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }
    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    const { detail, directorId, ...movieRest } = updateMovieDto;

    let newDirector: Director;
    if (directorId) {
      const director = await this.directorRepository.findOneBy({
        id: directorId,
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
      }

      newDirector = director;
    }

    if (movieRest) {
      await this.movieRepository.update(id, {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      });
    }

    if (detail) {
      await this.movieDetailRepository.update(movie.detail.id, { detail });
    }

    const updatedMovie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director'],
    });

    return updatedMovie;
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    await this.movieRepository.delete({ id });

    await this.movieDetailRepository.delete({ id: movie.detail.id });

    return id;
  }
}
