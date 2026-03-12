import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StaffPermission } from '../../../common/authz/rbac.constants';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwtSecret'),
    });
  }

  async validate(payload: { sub: string; email: string; name: string }) {
    const memberships = await this.prisma.branchMembership.findMany({
      where: { userId: payload.sub },
      include: { permissions: true },
    });

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      memberships: memberships.map((membership) => ({
        branchId: membership.branchId,
        role: membership.role,
        permissions: membership.permissions.map(
          (permission) => permission.permission as StaffPermission,
        ),
      })),
    };
  }
}
