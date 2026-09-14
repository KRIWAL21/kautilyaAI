import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog } from './schemas/activity-log.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLog>,
  ) {}

  async logAction(data: { brokerId?: string; action: string; resource: string; metadata?: any; ipAddress?: string }) {
    const newLog = new this.activityLogModel(data);
    await newLog.save();
  }
}
