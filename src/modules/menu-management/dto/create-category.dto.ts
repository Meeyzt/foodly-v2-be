import { IsInt, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  menuId!: string;

  @IsString()
  name!: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;
}
