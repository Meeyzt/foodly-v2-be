import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Authz } from '../../common/authz/authz.decorator';
import { AuthzGuard } from '../../common/authz/authz.guard';
import { BRANCH_ROLES } from '../../common/authz/rbac.constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignsService } from './campaigns.service';

@Controller('staff/branches/:branchId/campaigns')
@UseGuards(JwtAuthGuard, AuthzGuard)
@Authz({
  branchParam: 'branchId',
  roles: [BRANCH_ROLES.BUSINESS_ADMIN, BRANCH_ROLES.BRANCH_MANAGER],
})
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  listCampaigns(@Param('branchId') branchId: string) {
    return this.campaignsService.listCampaigns(branchId);
  }

  @Get(':campaignId')
  getCampaign(@Param('branchId') branchId: string, @Param('campaignId') campaignId: string) {
    return this.campaignsService.getCampaign(branchId, campaignId);
  }

  @Post()
  createCampaign(@Param('branchId') branchId: string, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(branchId, dto);
  }

  @Patch(':campaignId')
  updateCampaign(
    @Param('branchId') branchId: string,
    @Param('campaignId') campaignId: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.updateCampaign(branchId, campaignId, dto);
  }

  @Delete(':campaignId')
  deleteCampaign(@Param('branchId') branchId: string, @Param('campaignId') campaignId: string) {
    return this.campaignsService.deleteCampaign(branchId, campaignId);
  }

  @Get(':campaignId/segment-preview')
  previewSegment(
    @Param('branchId') branchId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return this.campaignsService.previewSegment(branchId, campaignId);
  }
}
