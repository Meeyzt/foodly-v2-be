import { IsIn, IsString } from 'class-validator';

import { BRANCH_ROLES } from '../../../common/authz/rbac.constants';

const BRANCH_ROLE_VALUES = Object.values(BRANCH_ROLES);

export class UpdateBranchMembershipRoleDto {
  @IsString()
  @IsIn(BRANCH_ROLE_VALUES)
  role!: (typeof BRANCH_ROLE_VALUES)[number];
}
