import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { MovieDetail } from './entity/movie-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      const count = await qr.manager.countBy(Movie, {
        title: createMovieDto.title,
      });

      if (count !== 0) {
        throw new BadRequestException('이미 존재하는 영화 제목입니다!');
      }

      const director = await qr.manager.findOneBy(Director, {
        id: createMovieDto.directorId,
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
      }

      const genres = await qr.manager.find(Genre, {
        where: {
          // id: Or(...createMovieDto.genreIds.map((item) => Equal(item))),
          id: In(createMovieDto.genreIds),
        },
      });

      if (genres.length != createMovieDto.genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 ID의 장르입니다! idx:[${createMovieDto.genreIds.filter((item) => genres.findIndex((genre) => genre.id === item) === -1).toString()}]`,
        );
      }

      const createdMovieDetail = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(MovieDetail)
        .values({
          detail: createMovieDto.detail,
        })
        .execute();

      const createdMovie = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(Movie)
        .values({
          title: createMovieDto.title,
          detail: {
            id: createdMovieDetail.identifiers[0].id,
          },
          director: {
            id: createMovieDto.directorId,
          },
        })
        .execute();

      await qr.manager
        .createQueryBuilder()
        .relation(Movie, 'genres')
        .of(createdMovie.identifiers[0].id)
        .add(genres);

      await qr.commitTransaction();
      return this.movieRepository.findOne({
        where: { id: createdMovie.identifiers[0].id },
        relations: ['genres', 'director', 'detail'],
      });

      // const createdMovie = await this.movieRepository.save({
      //   title: createMovieDto.title,
      //   detail: {
      //     detail: createMovieDto.detail,
      //   },
      //   genres,
      //   director,
      // });
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async findAll(dto: GetMoviesDto) {
    const { title, take, page } = dto;

    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.director', 'director');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%{title}%` });
    }

    if (take && page) {
      this.commonService.applyPagePaginationParamsToQb(qb, dto);
    }

    return qb.getManyAndCount();
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });
    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
    }
    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['detail'],
      });

      if (!movie) {
        throw new NotFoundException(`존재하지 않는 ID 값의 영화입니다!`);
      }

      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      let newDirector: Director;
      if (directorId) {
        const director = await qr.manager.findOneBy(Director, {
          id: directorId,
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
        }

        newDirector = director;
      }

      let newGenres: Genre[];
      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: {
            id: In(genreIds),
          },
        });

        if (genres.length !== genreIds.length) {
          throw new NotFoundException(
            `존재하지 않는 ID의 장르입니다! idx:[${genreIds.filter((item) => genres.findIndex((genre) => genre.id === item) === -1).toString()}]`,
          );
        }

        newGenres = genres;
      }

      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };

      if (movieRest) {
        await qr.manager.update(Movie, id, movieUpdateFields);
      }

      if (detail) {
        await qr.manager.update(MovieDetail, movie.detail.id, { detail });
      }

      const updatedMovie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['detail', 'director', 'genres'],
      });

      if (newGenres) {
        updatedMovie.genres = newGenres;
        // updatedMovie = await this.movieRepository.preload(updatedMovie);
        await qr.manager.save(Movie, updatedMovie);
      }

      qr.commitTransaction();

      return await this.movieRepository.findOne({
        where: { id },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      qr.rollbackTransaction();
      throw e;
    } finally {
      qr.release();
    }
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
