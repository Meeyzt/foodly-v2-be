import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, IsString, Min, ValidateNested } from 'class-validator';

export class CartPreviewItemDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CartPreviewDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartPreviewItemDto)
  items!: CartPreviewItemDto[];
}
