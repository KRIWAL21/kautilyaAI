import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './schemas/company.schema';
import { CompanyTheme } from './schemas/company-theme.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(CompanyTheme.name) private companyThemeModel: Model<CompanyTheme>,
  ) {}

  async findAll() {
    const companies = await this.companyModel.find({ isActive: true }).exec();
    
    // Fetch themes for all these companies
    const themes = await this.companyThemeModel.find({ 
      companyId: { $in: companies.map(c => c._id.toString()) } 
    }).exec();

    // Attach theme to each company
    return companies.map(company => {
      const theme = themes.find(t => t.companyId.toString() === company._id.toString());
      return {
        ...company.toObject(),
        theme: theme || null,
      };
    });
  }

  async findOne(id: string) {
    const company = await this.companyModel.findById(id).exec();
    if (!company) return null;

    const theme = await this.companyThemeModel.findOne({ companyId: id }).exec();

    return {
      ...company.toObject(),
      theme: theme || null,
    };
  }
}
