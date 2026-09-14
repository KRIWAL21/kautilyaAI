import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';
import { TeamMember, TeamMemberSchema } from './schemas/team-member.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: TeamMember.name, schema: TeamMemberSchema }])],
  controllers: [TeamMembersController],
  providers: [TeamMembersService]
})
export class TeamMembersModule {}
