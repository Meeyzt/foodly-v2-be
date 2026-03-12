import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BranchRole } from './rbac.constants';

import { AUTHZ_META_KEY, AuthzRequirement } from './authz.decorator';
import { AuthzRequestUser } from './authz.types';

type RequestWithAuth = {
  user?: AuthzRequestUser;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  authz?: { branchId: string; role: BranchRole };
};

@Injectable()
export class AuthzGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requirements = this.reflector.getAllAndOverride<AuthzRequirement>(
      AUTHZ_META_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirements) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication is required');
    }

    const branchId = this.resolveBranchId(request, requirements.branchParam ?? 'branchId');

    if (!branchId) {
      throw new ForbiddenException('branchId is required for scoped authorization');
    }

    const membership = user.memberships.find((m) => m.branchId === branchId);

    if (!membership) {
      throw new ForbiddenException('No branch access');
    }

    if (requirements.roles?.length && !requirements.roles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    if (
      requirements.permissions?.length &&
      !requirements.permissions.every((permission) =>
        membership.permissions.includes(permission),
      )
    ) {
      throw new ForbiddenException('Missing required permission');
    }

    request.authz = { branchId, role: membership.role };

    return true;
  }

  private resolveBranchId(request: RequestWithAuth, branchParam: string): string | undefined {
    const paramValue = request.params?.[branchParam];
    if (typeof paramValue === 'string' && paramValue.length > 0) {
      return paramValue;
    }

    const bodyValue = request.body?.[branchParam];
    if (typeof bodyValue === 'string' && bodyValue.length > 0) {
      return bodyValue;
    }

    const queryValue = request.query?.[branchParam];
    if (typeof queryValue === 'string' && queryValue.length > 0) {
      return queryValue;
    }

    return undefined;
  }
}
