import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { UsersModule } from './users/users.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';
import { LeadsModule } from './leads/leads.module';
import { ProjectsModule } from './projects/projects.module';
import { FollowUpsModule } from './followups/followups.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { MarketingImageGenModule } from './marketing-image-gen/marketing-image-gen.module';
import { CompaniesModule } from './companies/companies.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AiContentCreatorModule } from './ai-content-creator/ai-content-creator.module';

@Module({
  imports: [
    // 1. Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 2. Connect to MongoDB using the URI from .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // 3. Import our Audit module
    AuditModule,

    // 4. Import the Users module
    UsersModule,

    // 5. Import Site Visits module
    SiteVisitsModule,

    // 6. Import Leads module
    LeadsModule,

    // 7. Import Projects module
    ProjectsModule,

    // 8. Import FollowUps module
    FollowUpsModule,

    // 9. Import Tasks module
    TasksModule,

    // 10. Import Team Members module
    TeamMembersModule,

    // 11. Import Marketing Image Generation module
    MarketingImageGenModule,

    // 12. Import AI Content Creator module
    AiContentCreatorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Register the AuditInterceptor globally for all routes
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
