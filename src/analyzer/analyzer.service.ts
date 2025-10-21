/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { FilterDto } from './dto/filter.dto';

export interface StringAnalysis {
  input: string;
  length: number;
  is_palindrome: boolean;
  unique_characters: number;
  word_count: number;
  sha256_hash: string;
  character_frequency_map: Record<string, number>;
}

@Injectable()
export class AnalyzerService {
  private analyses: StringAnalysis[] = [];
  private applyFilters(filters: any) {
    try {
      let results = [...this.analyses];

      const {
        is_palindrome,
        min_length,
        max_length,
        word_count,
        contains_character,
      } = filters;
      // Validation checks
      if (
        is_palindrome !== undefined &&
        is_palindrome !== 'true' &&
        is_palindrome !== 'false'
      ) {
        throw new BadRequestException(
          "Invalid value for 'is_palindrome'. Must be true or false.",
        );
      }
      if (min_length !== undefined && isNaN(Number(min_length))) {
        throw new BadRequestException(
          "Invalid value for 'min_length'. Must be a number.",
        );
      }

      if (max_length !== undefined && isNaN(Number(max_length))) {
        throw new BadRequestException(
          "Invalid value for 'max_length'. Must be a number.",
        );
      }

      if (word_count !== undefined && isNaN(Number(word_count))) {
        throw new BadRequestException(
          "Invalid value for 'word_count'. Must be a number.",
        );
      }

      if (
        contains_character !== undefined &&
        (typeof contains_character !== 'string' ||
          contains_character.length !== 1)
      ) {
        throw new BadRequestException(
          "Invalid value for 'contains_character'. Must be a single character.",
        );
      }
      if (filters.is_palindrome !== undefined) {
        const isPalindrome =
          filters.is_palindrome === 'true' || filters.is_palindrome === true;
        results = results.filter(
          (result) => result.is_palindrome === isPalindrome,
        );
      }

      if (filters.max_length !== undefined) {
        results = results.filter(
          (result) => result.length <= filters.max_length!,
        );
      }

      if (filters.min_length !== undefined) {
        results = results.filter(
          (result) => result.length >= filters.min_length!,
        );
      }
      if (filters.word_count !== undefined) {
        results = results.filter(
          (result) => result.word_count === Number(filters.word_count),
        );
      }
      if (filters.contains_character) {
        const character = filters.contains_character.toLowerCase();
        results = results.filter((r) =>
          r.input.toLowerCase().includes(character),
        );
      }
      return results;
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to process filters');
    }
  }

  //Analyze a string
  analyzeString(input: string) {
    try {
      if (!input || input === undefined)
        throw new BadRequestException("Missing required field 'input'");

      if (typeof input !== 'string')
        throw new UnprocessableEntityException(
          "Invalid data type for 'input' (must be string)",
        );

      if (this.analyses.some((a) => a.input === input)) {
        throw new ConflictException(`"${input}" already exists`);
      }

      // Clean and normalize
      const cleanedInput = input.replace(/\s+/g, ' ').trim();
      const normalized = cleanedInput.toLowerCase().replace(/\s+/g, '');
      const reversed = normalized.split('').reverse().join('');

      //Analysis logic
      const length = input.length;
      const is_palindrome = normalized === reversed;
      const unique_characters = new Set(reversed).size;
      const word_count =
        cleanedInput.length > 0 ? cleanedInput.split(' ').length : 0;
      const sha256_hash = crypto
        .createHash('sha256')
        .update(cleanedInput)
        .digest('hex');
      const character_frequency_map: Record<string, number> = {};
      for (const char of normalized) {
        character_frequency_map[char] =
          (character_frequency_map[char] || 0) + 1;
      }

      const result: StringAnalysis = {
        input,
        length,
        is_palindrome,
        unique_characters,
        word_count,
        sha256_hash,
        character_frequency_map,
      };
      this.analyses.push(result);
      return result;
    } catch (error) {
      console.log(error);

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed, Please try again ');
    }
  }

  //Get all string(with filters)
  getAllString(filters: FilterDto) {
    try {
      const results = this.applyFilters(filters);
      return {
        data: results.map((result) => ({
          id: result.sha256_hash,
          value: result.input,
          properties: result,
          created_at: new Date().toISOString(),
        })),
        count: results.length,
        filters_applied: filters,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch data, Please try again',
      );
    }
  }
  //Get a string
  getString(input: string) {
    try {
      const value = this.analyses.find((a) => a.input === input);
      if (!value) {
        throw new NotFoundException(`Not found`);
      }
      return value;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed,Please try again');
    }
  }
  //Filter by natural language
  filterByNaturalLanguage(query: string) {
    try {
      if (!query) {
        throw new BadRequestException('Query text is required');
      }

      const normalized = query.toLowerCase().trim();
      const filters: any = {};

      // --- Detect palindrome ---
      if (
        normalized.includes('palindrome') ||
        normalized.includes('palindromic')
      ) {
        filters.is_palindrome = true;
      }
      if (
        normalized.includes('not palindrome') ||
        normalized.includes('not palindromic')
      ) {
        filters.is_palindrome = false;
      }

      // --- Word count ---
      const wordCountMatch = normalized.match(/(\d+)\s*word/);
      if (wordCountMatch) filters.word_count = parseInt(wordCountMatch[1]);
      else if (normalized.includes('single word')) filters.word_count = 1;

      // --- Length filters ---
      const minLengthMatch = normalized.match(/longer than\s*(\d+)/);
      if (minLengthMatch) filters.min_length = parseInt(minLengthMatch[1]);
      const maxLengthMatch = normalized.match(/shorter than\s*(\d+)/);
      if (maxLengthMatch) filters.max_length = parseInt(maxLengthMatch[1]);

      // --- Character containment ---
      const containsMatch = normalized.match(
        /containing (?:letter |character )?([a-z])/,
      );
      if (containsMatch) filters.contains_character = containsMatch[1];

      if (Object.keys(filters).length === 0) {
        throw new BadRequestException(
          'Unable to parse natural language query. Include words like "palindrome", "longer than", or "single word".',
        );
      }

      if (
        filters.is_palindrome === false &&
        filters.word_count === 1 &&
        normalized.includes('palindrome')
      ) {
        throw new UnprocessableEntityException(
          'Query parsed but resulted in conflicting filters',
        );
      }

      // --- Apply filters ---
      const results = this.applyFilters(filters);

      if (!results || results.length === 0) {
        throw new NotFoundException({
          message: 'No matching records found for your query',
          parsed_filters: filters,
        });
      }

      return {
        data: results,
        count: results.length,
        interpreted_query: {
          original: query,
          parsed_filters: filters,
        },
      };
    } catch (error) {
      console.error(error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Unexpected error while filtering natural language query: ${error.message || error}`,
      );
    }
  }

  //delete a string
  deleteString(input: string) {
    try {
      const initialLength = this.analyses.length;
      this.analyses = this.analyses.filter((a) => a.input !== input);
      if (this.analyses.length === initialLength) {
        throw new NotFoundException(`No record found for "${input}"`);
      }
      return { message: 'Deleted successfully' };
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete, Please try again`,
      );
    }
  }
}
