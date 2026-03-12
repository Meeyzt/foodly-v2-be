import { IsOptional, IsString } from 'class-validator';

export class OrderHistoryDto {
  @IsString()
  customerRef!: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}
