import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, Req, UseGuards, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, AddCollateralDto, UpdateSpotsDto } from './dto/project.dto';

import { S3Service } from './s3.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly s3Service: S3Service
  ) {}

  // -- Broker: search all projects ------------------------------
  @Get('broker')
  async getBrokerProjects(@Query('search') search?: string) {
    const projects = await this.projectsService.searchProjects(search || '');
    return { status: 'success', data: projects, totalCount: projects.length };
  }

  // -- Builder: get own projects (by companyId query param) -----
  @Get('builder/mine')
  async getBuilderProjects(@Query('companyId') companyId: string) {
    const projects = await this.projectsService.findByCompany(companyId);
    return { status: 'success', data: projects, totalCount: projects.length };
  }

  // -- Get single project ---------------------------------------
  @Get(':id')
  async getProject(@Param('id') id: string) {
    const project = await this.projectsService.findById(id);
    return { status: 'success', data: project };
  }

  // -- Builder: create project ----------------------------------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body() dto: CreateProjectDto,
    @Query('companyId') companyId: string,
  ) {
    const project = await this.projectsService.createProject(dto, companyId);
    return { status: 'success', data: project };
  }

  // -- Builder: update project ----------------------------------
  @Put(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProjectDto>,
  ) {
    const project = await this.projectsService.updateProject(id, dto);
    return { status: 'success', data: project };
  }

  // -- Builder: add collateral image + spots --------------------
  @Post(':id/collateral')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async addCollateral(
    @Param('id') projectId: string,
    @Body() dto: AddCollateralDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    
    // Upload file to S3
    const imageUrl = await this.s3Service.uploadFile(file, `projects/${projectId}/collaterals`);
    
    // Update DTO with the S3 URL
    dto.imageUrl = imageUrl;
    
    const project = await this.projectsService.addCollateral(projectId, dto);
    return { status: 'success', data: project };
  }

  // -- Builder: update spots on a specific collateral -----------
  @Put(':id/collateral/:colId/spots')
  async updateSpots(
    @Param('id') projectId: string,
    @Param('colId') collateralId: string,
    @Body() dto: UpdateSpotsDto,
  ) {
    const project = await this.projectsService.updateSpots(projectId, collateralId, dto);
    return { status: 'success', data: project };
  }

  // -- Builder: remove collateral -------------------------------
  @Delete(':id/collateral/:colId')
  async removeCollateral(
    @Param('id') projectId: string,
    @Param('colId') collateralId: string,
  ) {
    const project = await this.projectsService.removeCollateral(projectId, collateralId);
    return { status: 'success', data: project };
  }
}
