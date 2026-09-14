import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { BrokerLead, BrokerLeadSchema } from './schemas/lead.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: BrokerLead.name, schema: BrokerLeadSchema }])],
  controllers: [LeadsController],
  providers: [LeadsService]
})
export class LeadsModule {}
