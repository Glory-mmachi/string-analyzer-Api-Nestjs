/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterDto {
  @ApiPropertyOptional({
    description: 'Filter by palindrome status',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  is_palindrome?: string;

  @ApiPropertyOptional({ description: 'Minimum string length', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  min_length?: number;

  @ApiPropertyOptional({ description: 'Maximum string length', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  max_length?: number;

  @ApiPropertyOptional({ description: 'Exact word count', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  word_count?: number;

  @ApiPropertyOptional({
    description: 'String must contain this character',
    example: 'a',
  })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  contains_character?: string;
}
