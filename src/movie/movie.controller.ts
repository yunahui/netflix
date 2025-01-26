import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  createMovie(@Body() body: CreateMovieDto) {
    return this.movieService.create(body);
  }

  @Get()
  getMovies(@Query('title') title?: string) {
    return this.movieService.findAll(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
    return this.movieService.findOne(+id);
  }

  @Patch(':id')
  patchMovie(@Param('id') id: string, @Body() body: UpdateMovieDto) {
    return this.movieService.update(+id, body);
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    return this.movieService.remove(+id);
  }
}
