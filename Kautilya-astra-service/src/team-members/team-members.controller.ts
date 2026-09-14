import { Controller, Get } from '@nestjs/common';
import { TeamMembersService } from './team-members.service';

@Controller('team-members')
export class TeamMembersController {
  constructor(private readonly teamService: TeamMembersService) {}

  @Get()
  async getTeamMembers() {
    const data = await this.teamService.findAll();
    return { status: 'success', data, totalCount: data.length };
  }
}
