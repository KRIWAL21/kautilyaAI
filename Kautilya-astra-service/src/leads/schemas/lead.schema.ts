import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'customers', timestamps: true })
export class BrokerLead extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop()
  email: string;

  @Prop({ default: 'cold' })
  status: string;

  @Prop()
  conversionStage: string;

  @Prop()
  source: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  assignedToUserId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  projectId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  funnelId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  funnelStageId: string;

  @Prop({ type: [Object] })
  siteVisitHistory: any[];

  @Prop({ type: [Object] })
  companyIds: any[];
}
export const BrokerLeadSchema = SchemaFactory.createForClass(BrokerLead);
