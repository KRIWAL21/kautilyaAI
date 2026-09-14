import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ActivityLog extends Document {
  @Prop({ required: false })
  brokerId: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  resource: string;

  @Prop({ type: Object })
  metadata: any;

  @Prop()
  ipAddress: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
