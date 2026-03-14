import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class StockViewDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}
