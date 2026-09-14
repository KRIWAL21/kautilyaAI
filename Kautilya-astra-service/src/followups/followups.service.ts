import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FollowUp } from './schemas/followup.schema';

@Injectable()
export class FollowUpsService {
  constructor(@InjectModel(FollowUp.name) private followUpModel: Model<FollowUp>) {}

  async findAll() {
    return this.followUpModel.find().exec();
  }

  async findByBrokerId(brokerId?: string) {
    if (!brokerId || brokerId === 'undefined') {
      return this.followUpModel.find().exec();
    }
    return this.followUpModel.find({ brokerId }).exec();
  }

  async getStats(brokerId?: string) {
    const filter = brokerId ? { brokerId } : {};
    
    // Get today's start and end dates
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const total = await this.followUpModel.countDocuments(filter);
    const pending = await this.followUpModel.countDocuments({ ...filter, status: 'Pending' });
    const completed = await this.followUpModel.countDocuments({ ...filter, status: 'Completed' });
    const today = await this.followUpModel.countDocuments({
      ...filter,
      scheduledAt: { $gte: startOfToday, $lte: endOfToday }
    });
    
    return { total, today, pending, completed };
  }
}
