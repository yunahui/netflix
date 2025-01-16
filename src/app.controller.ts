import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

type Movie = {
  id: number;
  title: string;
};

const mockMovies: Movie[] = [
  { id: 1, title: '해리포터' },
  { id: 2, title: '반지의 제왕' },
];

@Controller('movies')
export class AppController {
  private readonly movies: Movie[] = mockMovies;
  private idCounter = 3;

  @Get()
  getMovies(@Query('title') title: string): Movie[] {
    if (title) {
      return this.movies.filter((movie) => movie.title.includes(title));
    }
    return this.movies;
  }

  @Get(':id')
  getMovie(@Param('id') id: string): Movie {
    // ? Array.find() : 첫 번째로 조건을 만족하는 원소를 반환하는 합수. 찾지 못하면 undefined 반환
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    return movie;
  }

  @Post()
  createMovie(@Body('title') title: string): Movie {
    const newMovie = { id: this.idCounter++, title };
    this.movies.push(newMovie);
    return newMovie;
  }

  @Patch(':id')
  patchMovie(@Param('id') id: string, @Body('title') title: string): Movie {
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    // ? Object.assign(target, source1, source2, ...) : target 객체에 source1, source2, ... 를 복사하는 함수 (얕은 복사)
    Object.assign(movie, { title });

    return movie;
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string): number {
    // ? Array.findIndex() : 첫 번째로 조건을 만족하는 원소의 index를 반환하는 함수. 찾지 못하면 -1 반환
    const index = this.movies.findIndex((m) => m.id === +id);

    if (index === -1) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }

    // ? Array.splice(start, deleteCount, item1, item2, ...) : start 인덱스부터 deleteCount 개의 요소를 삭제하고 후미에 item1, item2, ... 를 추가
    this.movies.splice(index, 1);

    return +id;
  }
}
