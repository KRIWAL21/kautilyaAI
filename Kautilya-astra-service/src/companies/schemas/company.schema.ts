import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'companies', timestamps: true })
export class Company extends Document {
  @Prop()
  aboutUs: string;

  @Prop()
  email: string;

  @Prop()
  companyName: string;

  @Prop()
  newAddress: string;

  @Prop()
  newReraNumber: string;

  @Prop()
  contactNumber: string;

  @Prop()
  isActive: boolean;

  @Prop()
  tenantSlug: string;

  // Wati / N8N Integration fields (hidden from simple queries but exist in DB)
  @Prop({ select: false })
  watiMessagingApiUrl: string;

  @Prop({ select: false })
  watiPhoneNumber: string;

  @Prop({ select: false })
  authorizationToken: string;

  @Prop({ select: false })
  n8nWebhookUrl: string;

  @Prop({ select: false })
  n8nCompletionSecret: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
