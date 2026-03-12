import { BranchRole, StaffPermission } from './rbac.constants';

export type BranchAccessContext = {
  branchId: string;
  role: BranchRole;
  permissions: StaffPermission[];
};

export type AuthzRequestUser = {
  userId: string;
  email: string;
  name: string;
  memberships: BranchAccessContext[];
};
