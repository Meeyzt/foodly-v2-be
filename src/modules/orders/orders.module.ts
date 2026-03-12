import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrderStateMachine } from './domain/order-state.machine';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderStateMachine],
})
export class OrdersModule {}
