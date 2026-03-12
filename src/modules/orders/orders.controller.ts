import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEligibleDto } from './dto/review-eligible.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
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

  @Post('customer/orders/:orderId/reviews')
  createReview(@Param('orderId') orderId: string, @Body() dto: CreateReviewDto) {
    return this.ordersService.createReview(orderId, dto.customerRef, dto.rating, dto.comment);
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

  @UseGuards(JwtAuthGuard, AuthzGuard)
  @Authz({
    branchParam: 'branchId',
    roles: [
      BRANCH_ROLES.BUSINESS_ADMIN,
      BRANCH_ROLES.BRANCH_MANAGER,
      BRANCH_ROLES.STAFF,
    ],
  })
  @Patch('staff/branches/:branchId/orders/:orderId/status')
  updateOrderStatus(
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: { user: AuthzRequestUser },
  ) {
    return this.ordersService.updateOrderStatus(branchId, orderId, dto.status, req.user);
  }
}
