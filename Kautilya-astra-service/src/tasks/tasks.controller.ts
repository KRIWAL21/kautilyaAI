import { Controller, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('broker-task-management')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks() {
    const data = await this.tasksService.findAll();
    return { status: 'success', data, totalCount: data.length };
  }
}
