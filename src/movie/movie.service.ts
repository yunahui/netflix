import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
export interface Movie {
  id: number;
  title: string;
  genre: string;
}

const mockMovies: Movie[] = [
  { id: 1, title: '해리포터', genre: '판타지' },
  { id: 2, title: '반지의 제왕', genre: '판타지' },
];

@Injectable()
export class MovieService {
  private readonly movies: Movie[] = mockMovies;
  private idCounter = 3;

  createMovie(createMovieDto: CreateMovieDto): Movie {
    const newMovie = { id: this.idCounter++, ...createMovieDto };
    this.movies.push(newMovie);
    return newMovie;
  }

  getManyMovies(title?: string): Movie[] {
    if (title) {
      return this.movies.filter((movie) => movie.title.includes(title));
    }
    return this.movies;
  }

  getMovieById(id: number): Movie {
    const movie = this.movies.find((m) => m.id === id);
    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }
    return movie;
  }

  updateMovie(id: number, updateMovieDto: UpdateMovieDto): Movie {
    const movie = this.movies.find((m) => m.id === id);

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    Object.assign(movie, { ...updateMovieDto });
    return movie;
  }

  deleteMovie(id: number): number {
    const index = this.movies.findIndex((m) => m.id === id);

    if (index === -1) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    this.movies.splice(index, 1);
    return id;
  }
}
