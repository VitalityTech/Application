/* eslint-disable @typescript-eslint/no-unsafe-call */

import { IsOptional, IsArray, IsString, ArrayMaxSize } from 'class-validator';

export class CreateEventDto {
  title: string;
  description?: string;
  location?: string;
  startDate: string | Date;
  endDate?: string | Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: 'Maximum 5 tags allowed per event' })
  tags?: string[];
}
