import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'brokertasks', timestamps: true })
export class BrokerTask extends Document {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  status: string;

  @Prop()
  dueDate: string;
}
export const BrokerTaskSchema = SchemaFactory.createForClass(BrokerTask);
