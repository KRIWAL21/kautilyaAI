import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ActivityLog.name, schema: ActivityLogSchema }])
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
