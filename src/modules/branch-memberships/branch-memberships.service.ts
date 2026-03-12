import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BRANCH_ROLES } from '../../common/authz/rbac.constants';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BranchMembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateRole(branchId: string, membershipId: string, role: string) {
    const membership = await this.prisma.branchMembership.findFirst({
      where: { id: membershipId, branchId },
      select: { id: true, role: true },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (!Object.values(BRANCH_ROLES).includes(role as (typeof BRANCH_ROLES)[keyof typeof BRANCH_ROLES])) {
      throw new BadRequestException('Unsupported role');
    }

    return this.prisma.branchMembership.update({
      where: { id: membershipId },
      data: { role },
      include: { permissions: true },
    });
  }

  async assignPermission(branchId: string, membershipId: string, permission: string) {
    const membership = await this.prisma.branchMembership.findFirst({
      where: { id: membershipId, branchId },
      select: { id: true },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    await this.prisma.branchMembershipPermission.upsert({
      where: {
        membershipId_permission: {
          membershipId,
          permission,
        },
      },
      update: {},
      create: {
        membershipId,
        permission,
      },
    });

    return this.prisma.branchMembership.findUnique({
      where: { id: membershipId },
      include: { permissions: true },
    });
  }

  async removePermission(branchId: string, membershipId: string, permission: string) {
    const membership = await this.prisma.branchMembership.findFirst({
      where: { id: membershipId, branchId },
      select: { id: true },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    await this.prisma.branchMembershipPermission.deleteMany({
      where: {
        membershipId,
        permission,
      },
    });

    return this.prisma.branchMembership.findUnique({
      where: { id: membershipId },
      include: { permissions: true },
    });
  }
}
