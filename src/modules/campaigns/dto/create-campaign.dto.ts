import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

import { CampaignSegmentType } from './campaign-segment-type.enum';

export class CreateCampaignDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CampaignSegmentType)
  segmentType!: CampaignSegmentType;

  @ValidateIf((o: CreateCampaignDto) => o.segmentType === CampaignSegmentType.FREQUENT_CUSTOMERS)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  segmentMinOrderCount?: number;

  @ValidateIf((o: CreateCampaignDto) => o.segmentType === CampaignSegmentType.HIGH_SPENDERS)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  segmentMinTotalSpent?: number;

  @ValidateIf((o: CreateCampaignDto) => o.segmentType === CampaignSegmentType.DORMANT_CUSTOMERS)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  segmentDormantDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  discountRate?: number;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
