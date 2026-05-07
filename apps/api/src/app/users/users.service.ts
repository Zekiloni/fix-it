import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto, IUser, UserRole } from '@fix-it/shared';
import { OrganizationsService } from '../organizations/organizations.service';
import { User, UserDocument } from './schemas/user.schema';
import { toUser } from './mappers/user.mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly model: Model<UserDocument>,
    private readonly organizations: OrganizationsService,
  ) {}

  async create(dto: CreateUserDto): Promise<IUser> {
    const created = await this.model.create(dto);
    return toUser(created);
  }

  async findById(id: string): Promise<IUser> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`User ${id} not found`);
    return toUser(doc);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await this.model.findOne({ email: email.toLowerCase() }).exec();
    return doc ? toUser(doc) : null;
  }

  async setRole(id: string, role: UserRole): Promise<IUser> {
    const doc = await this.model
      .findByIdAndUpdate(id, { role }, { new: true })
      .exec();
    if (!doc) throw new NotFoundException(`User ${id} not found`);
    return toUser(doc);
  }

  async assignOrganization(
    id: string,
    organizationId: string | null,
  ): Promise<IUser> {
    if (organizationId) {
      const orgExists = await this.organizations.exists(organizationId);
      if (!orgExists) {
        throw new BadRequestException(`Organization ${organizationId} not found`);
      }
    }
    const update = organizationId
      ? { organization: new Types.ObjectId(organizationId) }
      : { $unset: { organization: 1 } };
    const doc = await this.model
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!doc) throw new NotFoundException(`User ${id} not found`);
    return toUser(doc);
  }

  async exists(id: string): Promise<boolean> {
    return (await this.model.exists({ _id: id })) !== null;
  }

  async getOrganizationId(id: string): Promise<string | null> {
    const doc = await this.model.findById(id, 'organization').lean().exec();
    if (!doc) throw new NotFoundException(`User ${id} not found`);
    return doc.organization ? doc.organization.toString() : null;
  }
}
