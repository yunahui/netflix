import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async createMovie(createMovieDto: CreateMovieDto) {
    return await this.movieRepository.save(createMovieDto);
  }

  getManyMovies(title?: string) {
    // TODO: 나중에 title 필터 기능 추가하기
    return this.movieRepository.find();
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }
    return movie;
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    await this.movieRepository.update({ id }, updateMovieDto);

    const updatedMovie = await this.movieRepository.findOne({ where: { id } });

    return updatedMovie;
  }

  async deleteMovie(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    await this.movieRepository.delete({ id });

    return id;
  }
}
