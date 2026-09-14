import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowUpsController } from './followups.controller';
import { FollowUpsService } from './followups.service';
import { FollowUp, FollowUpSchema } from './schemas/followup.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: FollowUp.name, schema: FollowUpSchema }])],
  controllers: [FollowUpsController],
  providers: [FollowUpsService]
})
export class FollowUpsModule {}
