import { IsIn, IsString } from 'class-validator';

import { ORDER_STATUS } from '../domain/order.constants';

const UPDATABLE_ORDER_STATUSES = [
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_SERVICE,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
] as const;

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(UPDATABLE_ORDER_STATUSES)
  status!: (typeof UPDATABLE_ORDER_STATUSES)[number];
}
