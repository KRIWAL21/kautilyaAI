import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'brokerteammembers', timestamps: true })
export class TeamMember extends Document {
  @Prop()
  name: string;

  @Prop()
  role: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;
}
export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
