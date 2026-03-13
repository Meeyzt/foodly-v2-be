import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { CampaignSegmentType } from './dto/campaign-segment-type.enum';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  listCampaigns(branchId: string) {
    return this.prisma.campaign.findMany({
      where: { branchId },
      orderBy: [{ isActive: 'desc' }, { startsAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getCampaign(branchId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, branchId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found for branch');
    }

    return campaign;
  }

  async createCampaign(branchId: string, dto: CreateCampaignDto) {
    const payload = this.buildCampaignPayload(dto);

    return this.prisma.campaign.create({
      data: {
        branchId,
        ...payload,
      },
    });
  }

  async updateCampaign(branchId: string, campaignId: string, dto: UpdateCampaignDto) {
    const current = await this.getCampaign(branchId, campaignId);
    const payload = this.buildCampaignPayload({
      name: dto.name ?? current.name,
      description: dto.description ?? current.description ?? undefined,
      segmentType: dto.segmentType ?? (current.segmentType as CampaignSegmentType),
      segmentMinOrderCount: dto.segmentMinOrderCount ?? current.segmentMinOrderCount ?? undefined,
      segmentMinTotalSpent: dto.segmentMinTotalSpent ?? current.segmentMinTotalSpent ?? undefined,
      segmentDormantDays: dto.segmentDormantDays ?? current.segmentDormantDays ?? undefined,
      discountRate: dto.discountRate ?? current.discountRate ?? undefined,
      startsAt: dto.startsAt ?? current.startsAt.toISOString(),
      endsAt: dto.endsAt ?? current.endsAt.toISOString(),
      isActive: dto.isActive ?? current.isActive,
    });

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: payload,
    });
  }

  async deleteCampaign(branchId: string, campaignId: string) {
    await this.getCampaign(branchId, campaignId);

    return this.prisma.campaign.delete({ where: { id: campaignId } });
  }

  async previewSegment(branchId: string, campaignId: string) {
    const campaign = await this.getCampaign(branchId, campaignId);
    const grouped = await this.prisma.order.groupBy({
      by: ['customerRef'],
      where: { branchId },
      _count: { customerRef: true },
      _sum: { totalAmount: true },
      _max: { placedAt: true },
    });

    const now = Date.now();
    const eligible = grouped.filter((item) => {
      if (campaign.segmentType === CampaignSegmentType.ALL_CUSTOMERS) {
        return true;
      }
      if (campaign.segmentType === CampaignSegmentType.FREQUENT_CUSTOMERS) {
        return item._count.customerRef >= (campaign.segmentMinOrderCount ?? 1);
      }
      if (campaign.segmentType === CampaignSegmentType.HIGH_SPENDERS) {
        return (item._sum.totalAmount ?? 0) >= (campaign.segmentMinTotalSpent ?? 0);
      }
      if (campaign.segmentType === CampaignSegmentType.DORMANT_CUSTOMERS) {
        if (!item._max.placedAt) {
          return false;
        }
        const dormantMs = (campaign.segmentDormantDays ?? 1) * 24 * 60 * 60 * 1000;
        return now - item._max.placedAt.getTime() >= dormantMs;
      }

      return false;
    });

    return {
      campaignId: campaign.id,
      segmentType: campaign.segmentType,
      totalCustomers: grouped.length,
      eligibleCustomers: eligible.length,
      sampleCustomerRefs: eligible.slice(0, 10).map((item) => item.customerRef),
    };
  }

  private buildCampaignPayload(dto: {
    name: string;
    description?: string;
    segmentType: CampaignSegmentType;
    segmentMinOrderCount?: number;
    segmentMinTotalSpent?: number;
    segmentDormantDays?: number;
    discountRate?: number;
    startsAt: string;
    endsAt: string;
    isActive?: boolean;
  }) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid campaign date range');
    }

    if (startsAt >= endsAt) {
      throw new BadRequestException('Campaign start date must be before end date');
    }

    if (
      dto.segmentType === CampaignSegmentType.FREQUENT_CUSTOMERS &&
      (!dto.segmentMinOrderCount || dto.segmentMinOrderCount < 1)
    ) {
      throw new BadRequestException('segmentMinOrderCount is required for FREQUENT_CUSTOMERS');
    }

    if (
      dto.segmentType === CampaignSegmentType.HIGH_SPENDERS &&
      (!dto.segmentMinTotalSpent || dto.segmentMinTotalSpent <= 0)
    ) {
      throw new BadRequestException('segmentMinTotalSpent is required for HIGH_SPENDERS');
    }

    if (
      dto.segmentType === CampaignSegmentType.DORMANT_CUSTOMERS &&
      (!dto.segmentDormantDays || dto.segmentDormantDays < 1)
    ) {
      throw new BadRequestException('segmentDormantDays is required for DORMANT_CUSTOMERS');
    }

    return {
      name: dto.name,
      description: dto.description,
      segmentType: dto.segmentType,
      segmentMinOrderCount:
        dto.segmentType === CampaignSegmentType.FREQUENT_CUSTOMERS
          ? dto.segmentMinOrderCount
          : null,
      segmentMinTotalSpent:
        dto.segmentType === CampaignSegmentType.HIGH_SPENDERS
          ? dto.segmentMinTotalSpent
          : null,
      segmentDormantDays:
        dto.segmentType === CampaignSegmentType.DORMANT_CUSTOMERS
          ? dto.segmentDormantDays
          : null,
      discountRate: dto.discountRate,
      startsAt,
      endsAt,
      isActive: dto.isActive ?? true,
    };
  }
}
