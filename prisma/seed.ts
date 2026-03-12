import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import { BRANCH_ROLES, STAFF_PERMISSIONS } from '../src/common/authz/rbac.constants';

const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'bootstrap-restaurant' },
    update: { name: 'Foodly Demo Restaurant' },
    create: {
      id: 'bootstrap-restaurant',
      name: 'Foodly Demo Restaurant',
      description: 'Bootstrap seed restaurant',
    },
  });

  const branch = await prisma.branch.upsert({
    where: { code: 'IST-001' },
    update: { name: 'Istanbul Branch' },
    create: {
      restaurantId: restaurant.id,
      name: 'Istanbul Branch',
      code: 'IST-001',
      address: 'Kadikoy / Istanbul',
    },
  });

  const hash = await bcrypt.hash('Passw0rd!123', 12);

  const [adminUser, managerUser, staffUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@foodly.local' },
      update: { name: 'Bootstrap Admin', passwordHash: hash },
      create: { email: 'admin@foodly.local', name: 'Bootstrap Admin', passwordHash: hash },
    }),
    prisma.user.upsert({
      where: { email: 'manager@foodly.local' },
      update: { name: 'Bootstrap Manager', passwordHash: hash },
      create: { email: 'manager@foodly.local', name: 'Bootstrap Manager', passwordHash: hash },
    }),
    prisma.user.upsert({
      where: { email: 'staff@foodly.local' },
      update: { name: 'Bootstrap Staff', passwordHash: hash },
      create: { email: 'staff@foodly.local', name: 'Bootstrap Staff', passwordHash: hash },
    }),
  ]);

  const adminMembership = await prisma.branchMembership.upsert({
    where: { userId_branchId: { userId: adminUser.id, branchId: branch.id } },
    update: { role: BRANCH_ROLES.BUSINESS_ADMIN },
    create: {
      userId: adminUser.id,
      branchId: branch.id,
      role: BRANCH_ROLES.BUSINESS_ADMIN,
    },
  });

  const managerMembership = await prisma.branchMembership.upsert({
    where: { userId_branchId: { userId: managerUser.id, branchId: branch.id } },
    update: { role: BRANCH_ROLES.BRANCH_MANAGER },
    create: {
      userId: managerUser.id,
      branchId: branch.id,
      role: BRANCH_ROLES.BRANCH_MANAGER,
    },
  });

  const staffMembership = await prisma.branchMembership.upsert({
    where: { userId_branchId: { userId: staffUser.id, branchId: branch.id } },
    update: { role: BRANCH_ROLES.STAFF },
    create: {
      userId: staffUser.id,
      branchId: branch.id,
      role: BRANCH_ROLES.STAFF,
    },
  });

  await prisma.branchMembershipPermission.deleteMany({
    where: {
      membershipId: {
        in: [adminMembership.id, managerMembership.id, staffMembership.id],
      },
    },
  });

  await prisma.branchMembershipPermission.createMany({
    data: [
      {
        membershipId: managerMembership.id,
        permission: STAFF_PERMISSIONS.BRANCH_MEMBERSHIP_MANAGE,
      },
      { membershipId: staffMembership.id, permission: STAFF_PERMISSIONS.QR_CONFIRM },
      {
        membershipId: staffMembership.id,
        permission: STAFF_PERMISSIONS.ORDER_STATUS_PREPARING,
      },
      {
        membershipId: staffMembership.id,
        permission: STAFF_PERMISSIONS.ORDER_STATUS_READY_FOR_SERVICE,
      },
      {
        membershipId: staffMembership.id,
        permission: STAFF_PERMISSIONS.ORDER_STATUS_DELIVERED,
      },
      {
        membershipId: staffMembership.id,
        permission: STAFF_PERMISSIONS.ORDER_STATUS_COMPLETED,
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log('Bootstrap seed completed', {
    branchId: branch.id,
    users: {
      admin: adminUser.email,
      manager: managerUser.email,
      staff: staffUser.email,
    },
  });
}

main()
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
