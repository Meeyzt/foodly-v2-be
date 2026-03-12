import { SetMetadata } from '@nestjs/common';
import { BranchRole, StaffPermission } from './rbac.constants';

export const AUTHZ_META_KEY = 'authz_requirements';

export type AuthzRequirement = {
  roles?: BranchRole[];
  permissions?: StaffPermission[];
  branchParam?: string;
};

export const Authz = (requirements: AuthzRequirement) =>
  SetMetadata(AUTHZ_META_KEY, requirements);
