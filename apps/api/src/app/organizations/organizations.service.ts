import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateOrganizationDto,
  IOrganization,
  UpdateOrganizationDto,
} from '@fix-it/shared';
import {
  Organization,
  OrganizationDocument,
} from './schemas/organization.schema';
import { toOrganization } from './mappers/organization.mapper';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private readonly model: Model<OrganizationDocument>,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<IOrganization> {
    const existing = await this.model.exists({ slug: dto.slug });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" already in use`);
    }
    const created = await this.model.create(dto);
    return toOrganization(created);
  }

  async findAll(): Promise<IOrganization[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).exec();
    return docs.map(toOrganization);
  }

  async findOne(id: string): Promise<IOrganization> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Organization ${id} not found`);
    return toOrganization(doc);
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<IOrganization> {
    if (dto.slug) {
      const clash = await this.model.exists({ slug: dto.slug, _id: { $ne: id } });
      if (clash) throw new ConflictException(`Slug "${dto.slug}" already in use`);
    }
    const doc = await this.model
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!doc) throw new NotFoundException(`Organization ${id} not found`);
    return toOrganization(doc);
  }

  async remove(id: string): Promise<void> {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Organization ${id} not found`);
  }

  async exists(id: string): Promise<boolean> {
    return (await this.model.exists({ _id: id })) !== null;
  }
}
