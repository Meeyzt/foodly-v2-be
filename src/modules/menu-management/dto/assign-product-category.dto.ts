import { IsString } from 'class-validator';

export class AssignProductCategoryDto {
  @IsString()
  categoryId!: string;
}
