import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGenreDto {
  @IsNotEmpty()
  @IsString()
  @Optional()
  name?: string;
}
