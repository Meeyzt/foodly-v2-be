import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, ORDER_STATUS } from './order.constants';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.DRAFT]: [ORDER_STATUS.QR_GENERATED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.QR_GENERATED]: [ORDER_STATUS.STAFF_CONFIRM_PENDING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.STAFF_CONFIRM_PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY_FOR_SERVICE, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY_FOR_SERVICE]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

@Injectable()
export class OrderStateMachine {
  transition(from: OrderStatus, to: OrderStatus): void {
    if (!allowedTransitions[from].includes(to)) {
      throw new BadRequestException(`Invalid order status transition: ${from} -> ${to}`);
    }
  }
}
