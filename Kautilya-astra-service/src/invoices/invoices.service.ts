import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from './schemas/invoice.schema';

@Injectable()
export class InvoicesService {
  constructor(@InjectModel(Invoice.name) private invoiceModel: Model<Invoice>) {}

  async findAll() {
    return this.invoiceModel.find().exec();
  }

  async findByProjectId(projectId: string) {
    return this.invoiceModel.find({ projectId }).exec();
  }

  async findByCustomerPhone(phone: string) {
    // Basic formatting removal for search
    const digits = phone.replace(/\D/g, '');
    const searchString = digits.length > 10 ? '+' + digits : '+91' + digits; // naive approach
    
    return this.invoiceModel.find({ 
      customerPhone: { $regex: new RegExp(phone.replace(/\D/g, '').slice(-10), 'i') } 
    }).exec();
  }
}
