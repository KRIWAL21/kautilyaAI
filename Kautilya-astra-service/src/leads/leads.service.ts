import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrokerLead } from './schemas/lead.schema';

@Injectable()
export class LeadsService {
  constructor(@InjectModel(BrokerLead.name) private leadModel: Model<BrokerLead>) {}

  async findAll() {
    return this.leadModel.find().exec();
  }

  async getStats() {
    const total = await this.leadModel.countDocuments();
    const hot = await this.leadModel.countDocuments({ status: { $regex: /hot/i } });
    const warm = await this.leadModel.countDocuments({ status: { $regex: /warm/i } });
    const cold = await this.leadModel.countDocuments({ status: { $regex: /cold/i } });
    return { totalLeads: total, hot, warm, cold };
  }
}
