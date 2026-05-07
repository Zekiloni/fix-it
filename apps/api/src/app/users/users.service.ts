import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, IUser, UserRole } from '@fix-it/shared';
import { OrganizationsService } from '../organizations/organizations.service';
import { User, UserDocument } from './schemas/user.schema';
import { toUser } from './mappers/user.mapper';

const PASSWORD_SALT_ROUNDS = 12;

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

  async createWithPassword(input: {
    email: string;
    name: string;
    password: string;
  }): Promise<IUser> {
    const email = input.email.toLowerCase();
    const exists = await this.model.exists({ email });
    if (exists) {
      throw new ConflictException(`Email "${email}" is already registered`);
    }
    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
    const created = await this.model.create({
      email,
      name: input.name,
      role: UserRole.User,
      passwordHash,
    });
    return toUser(created);
  }

  async verifyPassword(
    email: string,
    password: string,
  ): Promise<IUser | null> {
    const doc = await this.model
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
    if (!doc || !doc.passwordHash) return null;
    const ok = await bcrypt.compare(password, doc.passwordHash);
    return ok ? toUser(doc) : null;
  }

  async findOrCreateFromGoogle(input: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<IUser> {
    const email = input.email.toLowerCase();
    const existing = await this.model
      .findOne({ $or: [{ googleId: input.googleId }, { email }] })
      .exec();
    if (existing) {
      let dirty = false;
      if (!existing.googleId) {
        existing.googleId = input.googleId;
        dirty = true;
      }
      if (input.avatarUrl && existing.avatarUrl !== input.avatarUrl) {
        existing.avatarUrl = input.avatarUrl;
        dirty = true;
      }
      if (dirty) await existing.save();
      return toUser(existing);
    }
    const created = await this.model.create({
      email,
      name: input.name,
      role: UserRole.User,
      googleId: input.googleId,
      avatarUrl: input.avatarUrl,
    });
    return toUser(created);
  }
}
