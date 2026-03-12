import { IsIn, IsString } from 'class-validator';

import { STAFF_PERMISSIONS } from '../../../common/authz/rbac.constants';

const STAFF_PERMISSION_VALUES = Object.values(STAFF_PERMISSIONS);

export class AssignMembershipPermissionDto {
  @IsString()
  @IsIn(STAFF_PERMISSION_VALUES)
  permission!: (typeof STAFF_PERMISSION_VALUES)[number];
}
