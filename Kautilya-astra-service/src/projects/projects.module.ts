import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { S3Service } from './s3.service';
import { Project, ProjectSchema } from './schemas/project.schema';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    CompaniesModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, S3Service]
})
export class ProjectsModule {}
