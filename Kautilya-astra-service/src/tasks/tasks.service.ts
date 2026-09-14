import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrokerTask } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(BrokerTask.name) private taskModel: Model<BrokerTask>) {}

  async findAll() {
    return this.taskModel.find().exec();
  }
}
