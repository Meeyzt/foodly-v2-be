import { Module } from '@nestjs/common';

import { BranchMembershipsController } from './branch-memberships.controller';
import { BranchMembershipsService } from './branch-memberships.service';

@Module({
  controllers: [BranchMembershipsController],
  providers: [BranchMembershipsService],
})
export class BranchMembershipsModule {}
