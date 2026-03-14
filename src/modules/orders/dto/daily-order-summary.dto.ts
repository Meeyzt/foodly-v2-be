import { IsOptional, Matches } from 'class-validator';

export class DailyOrderSummaryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be formatted as YYYY-MM-DD',
  })
  date?: string;
}
