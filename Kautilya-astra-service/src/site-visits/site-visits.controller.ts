import { Controller, Get } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';

@Controller('site-visits')
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Get('agent/me')
  getAgentSiteVisits() {
    // Returning a mock array of site visits so the frontend table loads without errors!
    return {
      status: 'success',
      data: [
        {
          _id: 'visit_1',
          lead: { name: 'Rahul Sharma', phone: '+919876543210' },
          project: { name: 'Lodha Woods' },
          visitDate: '2026-08-15',
          visitTime: '10:30 AM',
          status: 'Scheduled',
          purpose: 'First Site Visit'
        }
      ]
    };
  }
}
