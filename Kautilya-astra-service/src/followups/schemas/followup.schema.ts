import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'followups', timestamps: true })
export class FollowUp extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  leadId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  brokerId: string;

  @Prop({ type: Date, required: true })
  scheduledAt: Date;

  @Prop()
  note: string;

  @Prop()
  actionType: string;

  @Prop({ default: 'Pending' })
  status: string;
}

export const FollowUpSchema = SchemaFactory.createForClass(FollowUp);
