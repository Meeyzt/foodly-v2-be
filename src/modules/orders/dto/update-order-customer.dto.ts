import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateOrderCustomerItemDto {
  @IsString()
  productId!: string;

  @Min(1)
  quantity!: number;
}

export class UpdateOrderCustomerDto {
  @IsString()
  customerRef!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderCustomerItemDto)
  items!: UpdateOrderCustomerItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
