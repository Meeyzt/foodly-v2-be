import { IsString } from 'class-validator';

export class ReviewEligibleDto {
  @IsString()
  customerRef!: string;
}
