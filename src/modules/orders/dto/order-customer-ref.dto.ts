import { IsString } from 'class-validator';

export class OrderCustomerRefDto {
  @IsString()
  customerRef!: string;
}
