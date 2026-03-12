import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BranchMembershipsModule } from './modules/branch-memberships/branch-memberships.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [appConfig, authConfig],
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    OrdersModule,
    BranchMembershipsModule,
  ],
})
export class AppModule {}
