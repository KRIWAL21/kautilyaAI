import { Controller, Get, Param } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll() {
    const data = await this.companiesService.findAll();
    return { status: 'success', data, totalCount: data.length };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.companiesService.findOne(id);
    return { status: 'success', data };
  }
}
