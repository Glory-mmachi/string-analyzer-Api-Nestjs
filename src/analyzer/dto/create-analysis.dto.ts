/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnalysisDto {
  @IsString()
  @IsNotEmpty({ message: 'text field cannot be empty.' })
  value: string;
}
