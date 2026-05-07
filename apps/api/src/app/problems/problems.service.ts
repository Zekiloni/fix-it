import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  CreateProblemDto,
  IProblem,
  ProblemCategory,
  ProblemStatus,
  UpdateProblemDto,
  UserRole,
} from '@fix-it/shared';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { RequestActor } from '../common/request-actor';
import { Problem, ProblemDocument } from './schemas/problem.schema';
import { toProblem } from './mappers/problem.mapper';

export interface ProblemFilter {
  status?: ProblemStatus;
  category?: ProblemCategory;
  organizationId?: string;
  authorId?: string;
  assigneeId?: string;
}

export interface NearbyQuery {
  lng: number;
  lat: number;
  radiusMeters: number;
  limit?: number;
}

@Injectable()
export class ProblemsService {
  constructor(
    @InjectModel(Problem.name)
    private readonly model: Model<ProblemDocument>,
    private readonly organizations: OrganizationsService,
    private readonly users: UsersService,
  ) {}

  async create(dto: CreateProblemDto, authorId: string): Promise<IProblem> {
    const created = await this.model.create({
      ...dto,
      author: new Types.ObjectId(authorId),
    });
    return toProblem(created);
  }

  async findAll(filter: ProblemFilter = {}): Promise<IProblem[]> {
    const query: FilterQuery<ProblemDocument> = {};
    if (filter.status) query.status = filter.status;
    if (filter.category) query.category = filter.category;
    if (filter.organizationId) query.organization = new Types.ObjectId(filter.organizationId);
    if (filter.authorId) query.author = new Types.ObjectId(filter.authorId);
    if (filter.assigneeId) query.assignee = new Types.ObjectId(filter.assigneeId);

    const docs = await this.model.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(toProblem);
  }

  async findNearby(q: NearbyQuery): Promise<IProblem[]> {
    const docs = await this.model
      .find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [q.lng, q.lat] },
            $maxDistance: q.radiusMeters,
          },
        },
      })
      .limit(q.limit ?? 100)
      .exec();
    return docs.map(toProblem);
  }

  async findOne(id: string): Promise<IProblem> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Problem ${id} not found`);
    return toProblem(doc);
  }

  async update(
    id: string,
    dto: UpdateProblemDto,
    actor: RequestActor,
  ): Promise<IProblem> {
    const doc = await this.loadOrThrow(id);
    this.assertCanEdit(doc, actor);
    Object.assign(doc, dto);
    await doc.save();
    return toProblem(doc);
  }

  async remove(id: string, actor: RequestActor): Promise<void> {
    const doc = await this.loadOrThrow(id);
    this.assertCanEdit(doc, actor);
    await doc.deleteOne();
  }

  async routeTo(id: string, organizationId: string): Promise<IProblem> {
    const orgExists = await this.organizations.exists(organizationId);
    if (!orgExists) {
      throw new BadRequestException(`Organization ${organizationId} not found`);
    }
    const doc = await this.model
      .findByIdAndUpdate(
        id,
        { organization: new Types.ObjectId(organizationId), assignee: undefined },
        { new: true },
      )
      .exec();
    if (!doc) throw new NotFoundException(`Problem ${id} not found`);
    return toProblem(doc);
  }

  async assignTo(id: string, assigneeId: string): Promise<IProblem> {
    const doc = await this.loadOrThrow(id);
    if (!doc.organization) {
      throw new BadRequestException(
        'Problem must be routed to an organization before assigning',
      );
    }
    const assigneeOrgId = await this.users.getOrganizationId(assigneeId);
    if (assigneeOrgId !== doc.organization.toString()) {
      throw new BadRequestException(
        'Assignee must belong to the routed organization',
      );
    }
    doc.assignee = new Types.ObjectId(assigneeId);
    await doc.save();
    return toProblem(doc);
  }

  async updateStatus(
    id: string,
    status: ProblemStatus,
    actor: RequestActor,
  ): Promise<IProblem> {
    const doc = await this.loadOrThrow(id);
    this.assertCanChangeStatus(doc, actor);
    doc.status = status;
    if (status === ProblemStatus.Resolved) {
      doc.resolvedAt = new Date();
    } else if (doc.resolvedAt) {
      doc.resolvedAt = undefined;
    }
    await doc.save();
    return toProblem(doc);
  }

  private async loadOrThrow(id: string): Promise<ProblemDocument> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Problem ${id} not found`);
    return doc;
  }

  private assertCanEdit(doc: ProblemDocument, actor: RequestActor): void {
    if (actor.role === UserRole.Admin) return;
    if (doc.author.toString() === actor.userId) return;
    throw new ForbiddenException('Only the author or an admin may modify this problem');
  }

  private assertCanChangeStatus(
    doc: ProblemDocument,
    actor: RequestActor,
  ): void {
    if (actor.role === UserRole.Admin) return;
    if (
      actor.role === UserRole.Operator &&
      doc.assignee &&
      doc.assignee.toString() === actor.userId
    ) {
      return;
    }
    throw new ForbiddenException(
      'Only the assigned operator or an admin may change status',
    );
  }
}
