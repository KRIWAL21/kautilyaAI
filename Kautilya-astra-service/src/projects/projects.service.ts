import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CompaniesService } from '../companies/companies.service';
import { CreateProjectDto, AddCollateralDto, UpdateSpotsDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private companiesService: CompaniesService,
  ) {}

  // -- Read ------------------------------------------------------

  async findAll() {
    return this.projectModel.find().exec();
  }

  async findById(id: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async findByCompany(companyId: string) {
    if (!companyId) {
      return this.projectModel.find({ $or: [{ companyId: "" }, { companyId: { $exists: false } }, { companyId: null }] }).sort({ createdAt: -1 }).exec();
    }
    return this.projectModel.find({ companyId }).sort({ createdAt: -1 }).exec();
  }

  async searchProjects(query: string) {
    let projects: any[] = [];
    if (!query) {
      projects = await this.findAll();
    } else {
      const regex = new RegExp(query, 'i');
      projects = await this.projectModel.find({
        $or: [
          { city: regex },
          { region: regex },
          { projectName: regex },
          { address: regex },
          { state: regex },
        ],
      }).exec();
    }

    const allCompanies = await this.companiesService.findAll();

    return projects.map((p) => {
      const projectData = p.toObject();
      const builderInfo = allCompanies.find(
        (c) => c._id.toString() === projectData.companyId?.toString(),
      );
      return {
        ...projectData,
        builderTheme: builderInfo?.theme || null,
        builderDetails: builderInfo
          ? {
              name: builderInfo.companyName,
              email: builderInfo.email,
              contact: builderInfo.contactNumber,
            }
          : null,
      };
    });
  }

  // -- Create / Update -------------------------------------------

  async createProject(dto: CreateProjectDto, companyId: string) {
    const project = new this.projectModel({
      ...dto,
      companyId: companyId || undefined,
      marketingCollateralSpots: [],
    });
    return project.save();
  }

  async updateProject(id: string, dto: Partial<CreateProjectDto>) {
    const project = await this.projectModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    ).exec();
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  // -- Collateral -------------------------------------------------

  async addCollateral(projectId: string, dto: AddCollateralDto) {
    const collateralEntry = {
      _id: new Types.ObjectId(),
      imageUrl: dto.imageUrl,
      title: dto.title || 'Marketing Collateral',
      spots: dto.spots || [],
      uploadedAt: new Date(),
    };

    const project = await this.projectModel.findByIdAndUpdate(
      projectId,
      { $push: { marketingCollateralSpots: collateralEntry } },
      { new: true },
    ).exec();

    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    return project;
  }

  async updateSpots(projectId: string, collateralId: string, dto: UpdateSpotsDto) {
    const project = await this.projectModel.findOneAndUpdate({ _id: projectId, 'marketingCollateralSpots._id': new Types.ObjectId(collateralId) } as any,
      {
        $set: { 'marketingCollateralSpots.$.spots': dto.spots },
      },
      { new: true },
    ).exec();

    if (!project) throw new NotFoundException('Project or collateral not found');
    return project;
  }

  async removeCollateral(projectId: string, collateralId: string) {
    const project = await this.projectModel.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          marketingCollateralSpots: { _id: new Types.ObjectId(collateralId) },
        },
      },
      { new: true },
    ).exec();
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    return project;
  }
}
