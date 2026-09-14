import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { BrokerTask, BrokerTaskSchema } from './schemas/task.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: BrokerTask.name, schema: BrokerTaskSchema }])],
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
