import { BadRequestException } from '@nestjs/common';

import { ORDER_STATUS } from './order.constants';
import { OrderStateMachine } from './order-state.machine';

describe('OrderStateMachine', () => {
  const machine = new OrderStateMachine();

  it('allows valid transition', () => {
    expect(() =>
      machine.transition(ORDER_STATUS.STAFF_CONFIRM_PENDING, ORDER_STATUS.CONFIRMED),
    ).not.toThrow();
  });

  it('rejects invalid transition', () => {
    expect(() => machine.transition(ORDER_STATUS.DRAFT, ORDER_STATUS.CONFIRMED)).toThrow(
      BadRequestException,
    );
  });
});
