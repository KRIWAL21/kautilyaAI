import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRole = 'BROKER' | 'BUILDER' | 'CLIENT' | 'broker' | 'agent' | 'agency' | 'owner' | 'buyer' | 'seller';

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop()
  email: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ type: String, required: false, default: null })
  otp: string | null;

  @Prop({ type: Date, required: false, default: null })
  otpExpiry: Date | null;

  // ── NEW FIELDS ──────────────────────────────────────
  @Prop({
    type: String,
    enum: ['BROKER', 'BUILDER', 'CLIENT', 'broker', 'agent', 'agency', 'owner', 'buyer', 'seller'],
    default: 'BROKER',
  })
  role: UserRole;

  @Prop({ type: String, default: null })
  city: string | null;

  /** true once the user has completed the post-OTP profile step */
  @Prop({ type: Boolean, default: false })
  profileComplete: boolean;

  @Prop({ type: String, default: null })
  languages: string | null;

  @Prop({ type: String, default: null })
  specialization: string | null;

  @Prop({ type: String, default: null })
  gstin: string | null;

  @Prop({ type: String, default: null })
  reraNumber: string | null;

  @Prop({ type: String, default: null })
  firmName: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
