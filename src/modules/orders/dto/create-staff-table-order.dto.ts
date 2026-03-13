import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { CartPreviewItemDto } from './cart-preview.dto';

export class CreateStaffTableOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartPreviewItemDto)
  items!: CartPreviewItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(128)
  customerRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
