import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember } from './schemas/team-member.schema';

@Injectable()
export class TeamMembersService {
  constructor(@InjectModel(TeamMember.name) private teamModel: Model<TeamMember>) {}

  async findAll() {
    return this.teamModel.find().exec();
  }
}
