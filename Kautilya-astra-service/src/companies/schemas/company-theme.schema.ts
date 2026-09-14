import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'companythemes', timestamps: true })
export class CompanyTheme extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  companyId: string;

  @Prop()
  accentColor: string;

  @Prop()
  backgroundColor: string;

  @Prop()
  borderColor: string;

  @Prop()
  brandName: string;

  @Prop()
  buttonRadius: string;

  @Prop()
  faviconUrl: string;

  @Prop()
  fontFamily: string;

  @Prop()
  isActive: boolean;

  @Prop()
  logoDarkUrl: string;

  @Prop()
  logoUrl: string;

  @Prop()
  mutedTextColor: string;

  @Prop()
  primaryColor: string;

  @Prop()
  secondaryColor: string;

  @Prop()
  surfaceColor: string;

  @Prop()
  textColor: string;
}

export const CompanyThemeSchema = SchemaFactory.createForClass(CompanyTheme);
