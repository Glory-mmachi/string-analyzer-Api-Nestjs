/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyzerService } from './analyzer.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { FilterDto } from './dto/filter.dto';

@ApiTags('String Analyzer')
@Controller('strings')
export class AnalyzerController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  @Get('filter-by-natural-language')
  @ApiOperation({
    summary: 'Filter strings using natural language queries',
    description:
      'Interprets natural language like "all single word palindromic strings" and applies filters accordingly.',
  })
  @ApiQuery({
    name: 'query',
    type: String,
    required: true,
    example: 'all single word palindromic strings',
    description: 'The natural language query to interpret and filter strings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Strings matching the interpreted query.',
    schema: {
      example: {
        data: [
          {
            id: 'hash1',
            value: 'madam',
            properties: { is_palindrome: true, word_count: 1 },
            created_at: '2025-10-20T12:00:00Z',
          },
        ],
        count: 1,
        interpreted_query: {
          original: 'all single word palindromic strings',
          parsed_filters: {
            is_palindrome: true,
            word_count: 1,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or missing query parameter.',
  })
  filterByNaturalLanguage(@Query('query') query: string) {
    return this.analyzerService.filterByNaturalLanguage(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Analyze a given string',
    description:
      'Takes a string input and returns an analysis including palindrome status, word count, unique characters, hash, and frequency map.',
  })
  @ApiBody({
    description: 'Input data for string analysis',
    type: CreateAnalysisDto,
    examples: {
      sample: {
        summary: 'Example input',
        value: { value: 'madam' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully analyzed the string',
    schema: {
      example: {
        id: '3e25960a79dbc69b674cd4ec67a72c62',
        value: 'madam',
        properties: {
          length: 5,
          is_palindrome: true,
          unique_characters: 3,
          word_count: 1,
          sha256_hash:
            '3e25960a79dbc69b674cd4ec67a72c62d6f8b0a05d5c1eab8f9f6b3f1e2b1c8e2',
          character_frequency_map: { m: 2, a: 2, d: 1 },
        },
        created_at: '2025-10-20T18:50:32.000Z',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request body or input' })
  @ApiResponse({ status: 409, description: 'Duplicate input detected' })
  analyzeString(@Body() createAnalysisDto: CreateAnalysisDto) {
    const { value } = createAnalysisDto;
    const { text, ...data } = this.analyzerService.analyzeString(value);
    return {
      id: data.sha256_hash,
      value: text,
      properties: data,
      created_at: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all analyzed strings (with optional filters)',
    description:
      'Retrieves all previously analyzed strings. You can filter by palindrome, length, word count, or character.',
  })
  @ApiResponse({
    status: 200,
    description: 'Filtered string results',
    schema: {
      example: {
        data: [
          {
            id: 'abc123',
            value: 'madam',
            properties: {
              length: 5,
              is_palindrome: true,
              unique_characters: 3,
              word_count: 1,
              sha256_hash:
                '3e25960a79dbc69b674cd4ec67a72c62d6f8b0a05d5c1eab8f9f6b3f1e2b1c8e2',
              character_frequency_map: { m: 2, a: 2, d: 1 },
            },
            created_at: '2025-10-20T18:00:00Z',
          },
        ],
        count: 1,
        filters_applied: {
          is_palindrome: true,
          min_length: 5,
          max_length: 20,
          word_count: 2,
          contains_character: 'a',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameter values or types',
  })
  getAllString(@Query() filterDto: FilterDto) {
    return this.analyzerService.getAllString(filterDto);
  }

  @Get(':value')
  @ApiOperation({
    summary: 'Get a string',
    description:
      'Fetches a string passed as a URL parameter and returns its computed properties.',
  })
  @ApiParam({
    name: 'value',
    required: true,
    description: 'The string to fetch',
    example: 'madam',
  })
  @ApiResponse({
    status: 200,
    description: 'String successfully fetched',
    schema: {
      example: {
        id: '7c4a8d09ca3762af61e59520943dc26494f8941b',
        value: 'madam',
        properties: {
          length: 7,
          is_palindrome: true,
          unique_characters: 4,
          word_count: 1,
          sha256_hash: '7c4a8d09ca3762af61e59520943dc26494f8941b',
          character_frequency_map: { r: 2, a: 2, c: 2, e: 1 },
        },
        created_at: '2025-10-20T18:53:45.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input string' })
  getString(@Param('value') value: string) {
    const { text, ...data } = this.analyzerService.getString(value);
    return {
      id: data.sha256_hash,
      value: text,
      properties: data,
      created_at: new Date().toISOString(),
    };
  }

  @Delete(':input')
  @ApiOperation({ summary: 'Delete an analyzed string' })
  @ApiParam({
    name: 'input',
    type: String,
    description: 'String value to delete',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  deleteString(@Param('input') input: string) {
    return this.analyzerService.deleteString(input);
  }
}
