import { Controller, Get, Query } from '@nestjs/common';
import { FollowUpsService } from './followups.service';

@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get()
  async getFollowUps(@Query('brokerId') brokerId?: string) {
    const data = await this.followUpsService.findByBrokerId(brokerId);
    return {
      status: 'success',
      data: {
        followUps: data,
        totalFollowUps: data.length,
        totalPages: 1,
        pageNumber: 1
      }
    };
  }

  @Get('stats')
  async getStats(@Query('brokerId') brokerId?: string) {
    const data = await this.followUpsService.getStats(brokerId);
    return { status: 'success', data };
  }

  @Get('by-lead')
  async getFollowUpsByLead(@Query('leadId') leadId: string) {
    const data = await this.followUpsService.findByBrokerId(undefined); // temporarily fetch all
    const filtered = leadId ? data.filter(f => f.leadId === leadId) : data;
    return {
      status: 'success',
      data: {
        followUps: filtered,
        totalFollowUps: filtered.length,
        totalPages: 1,
        pageNumber: 1
      }
    };
  }
}
