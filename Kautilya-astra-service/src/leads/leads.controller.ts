import { Controller, Get } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('users/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getLeads() {
    const leads = await this.leadsService.findAll();
    return {
      status: 'success',
      data: {
        leads: leads,
        totalLeads: leads.length,
        totalPages: 1,
        currentPage: 1
      }
    };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.leadsService.getStats();
    return { status: 'success', data: stats };
  }
}
