import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title?: string;

  @ArrayNotEmpty()
  @IsArray()
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  @IsOptional()
  genreIds?: number[];

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  detail?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  directorId?: number;
}
