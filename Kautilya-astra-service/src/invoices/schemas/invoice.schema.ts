import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'invoices', timestamps: true })
export class Invoice extends Document {
  @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ required: true })
  customerName: string;

  @Prop()
  customerEmail: string;

  @Prop()
  customerPhone: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description: string;

  @Prop({ type: Object })
  details: Record<string, any>;

  @Prop({ default: 'Pending' })
  status: string;

  @Prop()
  pdfUrl: string;

  @Prop()
  pdfKey: string;

  @Prop()
  rejectionReason: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  projectId: string;

  @Prop()
  invoiceDate: Date;

  @Prop()
  dueDate: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
