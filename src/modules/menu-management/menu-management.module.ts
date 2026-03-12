import { Module } from '@nestjs/common';

import { MenuManagementController } from './menu-management.controller';
import { MenuManagementService } from './menu-management.service';

@Module({
  controllers: [MenuManagementController],
  providers: [MenuManagementService],
})
export class MenuManagementModule {}
