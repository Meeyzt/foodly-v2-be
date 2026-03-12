import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Authz } from '../../common/authz/authz.decorator';
import { AuthzGuard } from '../../common/authz/authz.guard';
import { BRANCH_ROLES, STAFF_PERMISSIONS } from '../../common/authz/rbac.constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssignMembershipPermissionDto } from './dto/assign-membership-permission.dto';
import { UpdateBranchMembershipRoleDto } from './dto/update-branch-membership-role.dto';
import { BranchMembershipsService } from './branch-memberships.service';

@Controller('staff/branches/:branchId/memberships')
@UseGuards(JwtAuthGuard, AuthzGuard)
@Authz({
  branchParam: 'branchId',
  roles: [BRANCH_ROLES.BUSINESS_ADMIN, BRANCH_ROLES.BRANCH_MANAGER],
})
export class BranchMembershipsController {
  constructor(private readonly branchMembershipsService: BranchMembershipsService) {}

  @Patch(':membershipId/role')
  updateRole(
    @Param('branchId') branchId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: UpdateBranchMembershipRoleDto,
  ) {
    return this.branchMembershipsService.updateRole(branchId, membershipId, dto.role);
  }

  @Post(':membershipId/permissions')
  @Authz({
    branchParam: 'branchId',
    roles: [BRANCH_ROLES.BUSINESS_ADMIN, BRANCH_ROLES.BRANCH_MANAGER],
    permissions: [STAFF_PERMISSIONS.BRANCH_MEMBERSHIP_MANAGE],
  })
  assignPermission(
    @Param('branchId') branchId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: AssignMembershipPermissionDto,
  ) {
    return this.branchMembershipsService.assignPermission(
      branchId,
      membershipId,
      dto.permission,
    );
  }

  @Delete(':membershipId/permissions/:permission')
  @Authz({
    branchParam: 'branchId',
    roles: [BRANCH_ROLES.BUSINESS_ADMIN, BRANCH_ROLES.BRANCH_MANAGER],
    permissions: [STAFF_PERMISSIONS.BRANCH_MEMBERSHIP_MANAGE],
  })
  removePermission(
    @Param('branchId') branchId: string,
    @Param('membershipId') membershipId: string,
    @Param('permission') permission: string,
  ) {
    return this.branchMembershipsService.removePermission(branchId, membershipId, permission);
  }
}
