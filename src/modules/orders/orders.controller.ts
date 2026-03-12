import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BRANCH_ROLES } from '../../common/authz/rbac.constants';

import { Authz } from '../../common/authz/authz.decorator';
import { AuthzGuard } from '../../common/authz/authz.guard';
import { AuthzRequestUser } from '../../common/authz/authz.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartPreviewDto } from './dto/cart-preview.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderHistoryDto } from './dto/order-history.dto';
import { ReviewEligibleDto } from './dto/review-eligible.dto';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('customer/branches/:branchId/products')
  listProducts(@Param('branchId') branchId: string) {
    return this.ordersService.listProducts(branchId);
  }

  @Get('customer/branches/:branchId/products/:productId')
  productDetail(@Param('branchId') branchId: string, @Param('productId') productId: string) {
    return this.ordersService.productDetail(branchId, productId);
  }

  @Post('customer/branches/:branchId/cart-preview')
  cartPreview(@Param('branchId') branchId: string, @Body() dto: CartPreviewDto) {
    return this.ordersService.cartPreview(branchId, dto);
  }

  @Post('customer/orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('customer/orders/history')
  orderHistory(@Query() query: OrderHistoryDto) {
    return this.ordersService.orderHistory(query.customerRef, query.branchId);
  }

  @Get('customer/orders/review-eligible')
  reviewEligible(@Query() query: ReviewEligibleDto) {
    return this.ordersService.reviewEligible(query.customerRef);
  }

  @UseGuards(JwtAuthGuard, AuthzGuard)
  @Authz({
    branchParam: 'branchId',
    roles: [
      BRANCH_ROLES.BUSINESS_ADMIN,
      BRANCH_ROLES.BRANCH_MANAGER,
      BRANCH_ROLES.STAFF,
    ],
  })
  @Post('staff/branches/:branchId/orders/:orderId/scan-qr/confirm')
  staffConfirmQr(
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
    @Req() req: { user: AuthzRequestUser },
  ) {
    return this.ordersService.staffConfirmQr(branchId, orderId, req.user);
  }
}
