import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { BRANCH_ROLES, STAFF_PERMISSIONS } from '../../common/authz/rbac.constants';
import { AuthzRequestUser } from '../../common/authz/authz.types';
import { CartPreviewDto } from './dto/cart-preview.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_STATUS, QR_STATUS } from './domain/order.constants';
import { OrderStateMachine } from './domain/order-state.machine';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderStateMachine: OrderStateMachine,
  ) {}

  async listProducts(branchId: string) {
    return this.prisma.product.findMany({
      where: { branchId, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    });
  }

  async productDetail(branchId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, branchId, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: { select: { id: true, name: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async cartPreview(branchId: string, dto: CartPreviewDto) {
    const products = await this.prisma.product.findMany({
      where: {
        branchId,
        isActive: true,
        id: { in: dto.items.map((item) => item.productId) },
      },
      select: { id: true, name: true, price: true },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Some products are invalid or inactive');
    }

    const mapped = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const lineTotal = Number((product.price * item.quantity).toFixed(2));
      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal,
      };
    });

    const subtotal = Number(
      mapped.reduce((acc, item) => acc + item.lineTotal, 0).toFixed(2),
    );

    return {
      items: mapped,
      subtotalAmount: subtotal,
      totalAmount: subtotal,
    };
  }

  async createOrder(dto: CreateOrderDto) {
    const table = await this.prisma.table.findFirst({
      where: { id: dto.tableId, branchId: dto.branchId },
      select: { id: true, branchId: true },
    });

    if (!table) {
      throw new BadRequestException('Table does not belong to branch');
    }

    const preview = await this.cartPreview(dto.branchId, { items: dto.items });

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          branchId: dto.branchId,
          tableId: dto.tableId,
          customerRef: dto.customerRef,
          status: ORDER_STATUS.QR_GENERATED,
          subtotalAmount: preview.subtotalAmount,
          totalAmount: preview.totalAmount,
          notes: dto.notes,
          items: {
            create: preview.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
      });

      const qrCode = `ORD-${order.id}`;

      await tx.orderQR.create({
        data: {
          branchId: dto.branchId,
          tableId: dto.tableId,
          orderId: order.id,
          qrCode,
          status: QR_STATUS.GENERATED,
          generatedAt: new Date(),
        },
      });

      this.orderStateMachine.transition(
        ORDER_STATUS.QR_GENERATED,
        ORDER_STATUS.STAFF_CONFIRM_PENDING,
      );

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: ORDER_STATUS.STAFF_CONFIRM_PENDING },
        include: { items: true, qr: true },
      });

      await tx.orderQR.update({
        where: { orderId: order.id },
        data: { status: QR_STATUS.STAFF_CONFIRM_PENDING },
      });

      return updatedOrder;
    });
  }

  async orderHistory(customerRef: string, branchId?: string) {
    return this.prisma.order.findMany({
      where: {
        customerRef,
        ...(branchId ? { branchId } : {}),
      },
      include: { items: true, qr: true },
      orderBy: { placedAt: 'desc' },
    });
  }

  async reviewEligible(customerRef: string) {
    return this.prisma.order.findMany({
      where: {
        customerRef,
        status: ORDER_STATUS.COMPLETED,
        review: null,
      },
      select: {
        id: true,
        branchId: true,
        placedAt: true,
        completedAt: true,
      },
      orderBy: { placedAt: 'desc' },
    });
  }

  async staffConfirmQr(branchId: string, orderId: string, user: AuthzRequestUser) {
    const membership = user.memberships.find((m) => m.branchId === branchId);

    if (!membership) {
      throw new BadRequestException('No branch access');
    }

    const canConfirm =
      membership.role === BRANCH_ROLES.BUSINESS_ADMIN ||
      membership.role === BRANCH_ROLES.BRANCH_MANAGER ||
      membership.permissions.includes(STAFF_PERMISSIONS.QR_CONFIRM);

    if (!canConfirm) {
      throw new BadRequestException('No QR confirm permission');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, branchId },
        include: { qr: true },
      });

      if (!order || !order.qr) {
        throw new NotFoundException('Order QR not found');
      }

      if (order.status !== ORDER_STATUS.STAFF_CONFIRM_PENDING) {
        throw new BadRequestException('Order is not waiting for staff confirmation');
      }

      if (order.qr.status !== QR_STATUS.STAFF_CONFIRM_PENDING) {
        throw new BadRequestException('QR is not waiting for staff confirmation');
      }

      this.orderStateMachine.transition(order.status, ORDER_STATUS.CONFIRMED);

      await tx.orderQR.update({
        where: { orderId },
        data: {
          status: QR_STATUS.CONFIRMED,
          confirmedAt: new Date(),
          confirmedById: user.userId,
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: { status: ORDER_STATUS.CONFIRMED },
        include: { items: true, qr: true },
      });
    });
  }
}
