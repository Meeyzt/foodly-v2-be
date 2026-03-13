import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { BRANCH_ROLES, STAFF_PERMISSIONS } from '../src/common/authz/rbac.constants';

describe('Sprint-1 hardening (e2e)', () => {
  let app: NestFastifyApplication;
  const prisma = new PrismaClient();

  let branchId: string;
  let tableId: string;
  let menuId: string;
  let categoryId: string;
  let productId: string;

  let managerUserId: string;
  let staffUserId: string;
  let outsiderUserId: string;
  let managerMembershipId: string;
  let staffMembershipId: string;

  const managerEmail = 'manager.e2e@foodly.local';
  const staffEmail = 'staff.e2e@foodly.local';
  const outsiderEmail = 'outsider.e2e@foodly.local';
  const password = 'Passw0rd!123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.setGlobalPrefix('api');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    await resetDb();
    await seedBranchData();
    await registerUsers();
    await seedMemberships();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('authz: outsider cannot access branch membership permission management', async () => {
    const outsiderToken = await loginAndGetToken(outsiderEmail, password);

    await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/memberships/${staffMembershipId}/permissions`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ permission: STAFF_PERMISSIONS.QR_CONFIRM })
      .expect(403);
  });

  it('membership manager can assign/remove staff permission', async () => {
    const managerToken = await loginAndGetToken(managerEmail, password);

    await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/memberships/${staffMembershipId}/permissions`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ permission: STAFF_PERMISSIONS.QR_CONFIRM })
      .expect(201);

    const assigned = await prisma.branchMembershipPermission.findUnique({
      where: {
        membershipId_permission: {
          membershipId: staffMembershipId,
          permission: STAFF_PERMISSIONS.QR_CONFIRM,
        },
      },
    });
    expect(assigned).toBeTruthy();

    await request(app.getHttpServer())
      .delete(
        `/api/staff/branches/${branchId}/memberships/${staffMembershipId}/permissions/${STAFF_PERMISSIONS.QR_CONFIRM}`,
      )
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    const removed = await prisma.branchMembershipPermission.findUnique({
      where: {
        membershipId_permission: {
          membershipId: staffMembershipId,
          permission: STAFF_PERMISSIONS.QR_CONFIRM,
        },
      },
    });
    expect(removed).toBeNull();
  });

  it('qr confirm: staff with permission can confirm pending order QR', async () => {
    await prisma.branchMembershipPermission.create({
      data: { membershipId: staffMembershipId, permission: STAFF_PERMISSIONS.QR_CONFIRM },
    });

    const staffToken = await loginAndGetToken(staffEmail, password);
    const createdOrderId = await createCustomerOrder('customer-qr-confirm');

    const response = await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/orders/${createdOrderId}/scan-qr/confirm`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(201);

    expect(response.body.status).toBe('CONFIRMED');
    expect(response.body.qr.status).toBe('CONFIRMED');
  });

  it('order status: granular permission check + invalid transition guard', async () => {
    const staffToken = await loginAndGetToken(staffEmail, password);
    const createdOrderId = await createCustomerOrder('customer-invalid-transition');

    await request(app.getHttpServer())
      .patch(`/api/staff/branches/${branchId}/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'DELIVERED' })
      .expect(400);

    await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/orders/${createdOrderId}/scan-qr/confirm`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/staff/branches/${branchId}/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'PREPARING' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/staff/branches/${branchId}/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('same-table multi-order: allows concurrent order creation on same table', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/customer/orders')
      .send(orderPayload('same-table-a'))
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/api/customer/orders')
      .send(orderPayload('same-table-b'))
      .expect(201);

    expect(first.body.id).toBeDefined();
    expect(second.body.id).toBeDefined();
    expect(first.body.id).not.toEqual(second.body.id);
    expect(first.body.tableId).toEqual(tableId);
    expect(second.body.tableId).toEqual(tableId);
  });

  it('review create + eligibility: completed order can be reviewed once only', async () => {
    const managerToken = await loginAndGetToken(managerEmail, password);
    const customerRef = 'review-customer-1';
    const orderId = await createCustomerOrder(customerRef);

    await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/orders/${orderId}/scan-qr/confirm`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(201);

    for (const status of ['PREPARING', 'READY_FOR_SERVICE', 'DELIVERED', 'COMPLETED']) {
      await request(app.getHttpServer())
        .patch(`/api/staff/branches/${branchId}/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status })
        .expect(200);
    }

    const eligibleBefore = await request(app.getHttpServer())
      .get('/api/customer/orders/review-eligible')
      .query({ customerRef })
      .expect(200);
    expect(eligibleBefore.body.some((item: { id: string }) => item.id === orderId)).toBe(true);

    await request(app.getHttpServer())
      .post(`/api/customer/orders/${orderId}/reviews`)
      .send({ customerRef, rating: 5, comment: 'Great!' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/customer/orders/${orderId}/reviews`)
      .send({ customerRef, rating: 4 })
      .expect(400);

    const eligibleAfter = await request(app.getHttpServer())
      .get('/api/customer/orders/review-eligible')
      .query({ customerRef })
      .expect(200);
    expect(eligibleAfter.body.some((item: { id: string }) => item.id === orderId)).toBe(false);
  });

  it('order status idempotency: same target status update is safe', async () => {
    const managerToken = await loginAndGetToken(managerEmail, password);
    const orderId = await createCustomerOrder('idempotency-customer');

    await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/orders/${orderId}/scan-qr/confirm`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/staff/branches/${branchId}/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'PREPARING' })
      .expect(200);

    const second = await request(app.getHttpServer())
      .patch(`/api/staff/branches/${branchId}/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'PREPARING' })
      .expect(200);

    expect(second.body.status).toBe('PREPARING');
  });

  it('manager/business menu-category-product CRUD works with branch-scoped authz', async () => {
    const managerToken = await loginAndGetToken(managerEmail, password);
    const staffToken = await loginAndGetToken(staffEmail, password);

    await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/menus`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ name: 'Forbidden Menu' })
      .expect(403);

    const createdMenu = await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/menus`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: 'Manager Menu', isActive: true })
      .expect(201);

    const createdCategory = await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/categories`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ menuId: createdMenu.body.id, name: 'Soups', sortOrder: 2 })
      .expect(201);

    const createdProduct = await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/products`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        categoryId: createdCategory.body.id,
        name: 'Ezogelin',
        description: 'Hot',
        price: 120,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/staff/branches/${branchId}/products/${createdProduct.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ price: 130, isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/staff/branches/${branchId}/products/${createdProduct.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/staff/branches/${branchId}/categories/${createdCategory.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/staff/branches/${branchId}/menus/${createdMenu.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(menuId).toBeTruthy();
    expect(categoryId).toBeTruthy();
  });

  it('menu active/passive validation: last active menu cannot be deactivated and inactive menu products are hidden for customers', async () => {
    const managerToken = await loginAndGetToken(managerEmail, password);

    await request(app.getHttpServer())
      .patch(`/api/staff/branches/${branchId}/menus/${menuId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ isActive: false })
      .expect(400);

    const dinnerMenu = await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/menus`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: 'Dinner', isActive: true })
      .expect(201);

    const hiddenCategory = await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/categories`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ menuId: dinnerMenu.body.id, name: 'Hidden Items', sortOrder: 99 })
      .expect(201);

    const hiddenProduct = await request(app.getHttpServer())
      .post(`/api/staff/branches/${branchId}/products`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        categoryId: hiddenCategory.body.id,
        name: 'Secret Soup',
        price: 199,
        isActive: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/staff/branches/${branchId}/menus/${dinnerMenu.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/customer/branches/${branchId}/products/${hiddenProduct.body.id}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(`/api/customer/branches/${branchId}/cart-preview`)
      .send({ items: [{ productId: hiddenProduct.body.id, quantity: 1 }] })
      .expect(400);

    await request(app.getHttpServer())
      .delete(`/api/staff/branches/${branchId}/products/${hiddenProduct.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/staff/branches/${branchId}/categories/${hiddenCategory.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/staff/branches/${branchId}/menus/${dinnerMenu.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
  });

  async function resetDb() {
    await prisma.orderItem.deleteMany();
    await prisma.orderQR.deleteMany();
    await prisma.review.deleteMany();
    await prisma.order.deleteMany();
    await prisma.branchMembershipPermission.deleteMany();
    await prisma.branchMembership.deleteMany();
    await prisma.shift.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.analyticsEvent.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.table.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();
  }

  async function seedBranchData() {
    const restaurant = await prisma.restaurant.create({
      data: { name: 'E2E Restaurant' },
    });

    const branch = await prisma.branch.create({
      data: {
        restaurantId: restaurant.id,
        name: 'E2E Branch',
        code: 'E2E-001',
      },
    });
    branchId = branch.id;

    const table = await prisma.table.create({
      data: {
        branchId,
        code: 'A1',
        capacity: 4,
      },
    });
    tableId = table.id;

    const menu = await prisma.menu.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Main Menu',
      },
    });
    menuId = menu.id;

    const category = await prisma.category.create({
      data: {
        branchId,
        menuId: menu.id,
        name: 'Hot Meals',
        sortOrder: 1,
      },
    });
    categoryId = category.id;

    const product = await prisma.product.create({
      data: {
        branchId,
        categoryId: category.id,
        name: 'Burger',
        price: 210,
        isActive: true,
      },
    });
    productId = product.id;
  }

  async function registerUsers() {
    await request(app.getHttpServer()).post('/api/auth/register').send({
      email: managerEmail,
      name: 'Manager User',
      password,
    });

    await request(app.getHttpServer()).post('/api/auth/register').send({
      email: staffEmail,
      name: 'Staff User',
      password,
    });

    await request(app.getHttpServer()).post('/api/auth/register').send({
      email: outsiderEmail,
      name: 'Outsider User',
      password,
    });

    managerUserId = (
      await prisma.user.findUniqueOrThrow({ where: { email: managerEmail } })
    ).id;
    staffUserId = (await prisma.user.findUniqueOrThrow({ where: { email: staffEmail } })).id;
    outsiderUserId = (
      await prisma.user.findUniqueOrThrow({ where: { email: outsiderEmail } })
    ).id;
  }

  async function seedMemberships() {
    const managerMembership = await prisma.branchMembership.create({
      data: {
        userId: managerUserId,
        branchId,
        role: BRANCH_ROLES.BRANCH_MANAGER,
      },
    });
    managerMembershipId = managerMembership.id;

    const staffMembership = await prisma.branchMembership.create({
      data: {
        userId: staffUserId,
        branchId,
        role: BRANCH_ROLES.STAFF,
      },
    });
    staffMembershipId = staffMembership.id;

    await prisma.branchMembershipPermission.createMany({
      data: [
        {
          membershipId: managerMembershipId,
          permission: STAFF_PERMISSIONS.BRANCH_MEMBERSHIP_MANAGE,
        },
        {
          membershipId: staffMembershipId,
          permission: STAFF_PERMISSIONS.ORDER_STATUS_PREPARING,
        },
      ],
    });

    expect(outsiderUserId).toBeTruthy();
  }

  function orderPayload(customerRef: string) {
    return {
      branchId,
      tableId,
      customerRef,
      items: [{ productId, quantity: 1 }],
    };
  }

  async function createCustomerOrder(customerRef: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/customer/orders')
      .send(orderPayload(customerRef))
      .expect(201);

    return response.body.id as string;
  }

  async function loginAndGetToken(email: string, pass: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: pass })
      .expect(201);

    return response.body.accessToken as string;
  }
});
