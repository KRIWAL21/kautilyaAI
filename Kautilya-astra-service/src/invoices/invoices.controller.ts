import { Controller, Get, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(
    @Query('projectId') projectId?: string,
    @Query('phone') phone?: string
  ) {
    let invoices: any[] = [];
    if (projectId) {
      invoices = await this.invoicesService.findByProjectId(projectId);
    } else if (phone) {
      invoices = await this.invoicesService.findByCustomerPhone(phone);
    } else {
      invoices = await this.invoicesService.findAll();
    }
    
    return {
      status: 'success',
      data: invoices,
      totalCount: invoices.length,
    };
  }
}
