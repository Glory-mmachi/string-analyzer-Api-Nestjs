/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnalysisDto {
  @IsString()
  @IsNotEmpty({ message: 'Input field cannot be empty.' })
  input: string;
}
