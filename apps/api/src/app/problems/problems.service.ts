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
  IAttachment,
  IProblem,
  ProblemCategory,
  ProblemStatus,
  UpdateProblemDto,
  UserRole,
} from '@fix-it/shared';
import { NotificationsService } from '../notifications/notifications.service';
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
  q?: string;
}

const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    private readonly notifications: NotificationsService,
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

    const trimmed = filter.q?.trim();
    if (trimmed) {
      const pattern = new RegExp(escapeRegex(trimmed), 'i');
      query.$or = [
        { title: pattern },
        { description: pattern },
        { tags: pattern },
      ];
    }

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

  async stats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    medianResolutionHours: number | null;
  }> {
    const [total, byStatusAgg, byCategoryAgg, resolved] = await Promise.all([
      this.model.countDocuments().exec(),
      this.model
        .aggregate<{ _id: string; n: number }>([
          { $group: { _id: '$status', n: { $sum: 1 } } },
        ])
        .exec(),
      this.model
        .aggregate<{ _id: string; n: number }>([
          { $group: { _id: '$category', n: { $sum: 1 } } },
        ])
        .exec(),
      this.model
        .find(
          { status: ProblemStatus.Resolved, resolvedAt: { $exists: true } },
          'createdAt resolvedAt',
        )
        .lean()
        .exec(),
    ]);

    const toRecord = (rows: { _id: string; n: number }[]) =>
      Object.fromEntries(rows.map((r) => [r._id, r.n]));

    let medianResolutionHours: number | null = null;
    if (resolved.length > 0) {
      const hours = resolved
        .map((r) => {
          const created = new Date(
            (r as unknown as { createdAt: Date }).createdAt,
          ).getTime();
          const fixed = new Date(
            (r as unknown as { resolvedAt: Date }).resolvedAt,
          ).getTime();
          return (fixed - created) / 3_600_000;
        })
        .sort((a, b) => a - b);
      const mid = Math.floor(hours.length / 2);
      medianResolutionHours =
        hours.length % 2 === 0
          ? (hours[mid - 1] + hours[mid]) / 2
          : hours[mid];
    }

    return {
      total,
      byStatus: toRecord(byStatusAgg),
      byCategory: toRecord(byCategoryAgg),
      medianResolutionHours,
    };
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
    await this.notifications.create({
      recipientId: doc.author.toString(),
      kind: 'problem_routed',
      problemId: doc._id.toString(),
      problemTitle: doc.title,
      message: 'Your report was routed to an organization.',
    });
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
    await this.notifications.create({
      recipientId: assigneeId,
      kind: 'problem_assigned',
      problemId: doc._id.toString(),
      problemTitle: doc.title,
      message: `You were assigned: ${doc.title}`,
    });
    return toProblem(doc);
  }

  async addAttachment(
    id: string,
    attachment: IAttachment,
    actor: RequestActor,
  ): Promise<IProblem> {
    const doc = await this.loadOrThrow(id);
    this.assertCanEdit(doc, actor);
    doc.attachments.push(attachment);
    await doc.save();
    return toProblem(doc);
  }

  async removeAttachment(
    id: string,
    storageId: string,
    actor: RequestActor,
  ): Promise<{ problem: IProblem; removedStorageId: string | null }> {
    const doc = await this.loadOrThrow(id);
    this.assertCanEdit(doc, actor);
    const before = doc.attachments.length;
    doc.attachments = doc.attachments.filter((a) => a.storageId !== storageId);
    if (doc.attachments.length === before) {
      return { problem: toProblem(doc), removedStorageId: null };
    }
    await doc.save();
    return { problem: toProblem(doc), removedStorageId: storageId };
  }

  async updateStatus(
    id: string,
    status: ProblemStatus,
    actor: RequestActor,
  ): Promise<IProblem> {
    const doc = await this.loadOrThrow(id);
    this.assertCanChangeStatus(doc, actor);
    const prev = doc.status;
    doc.status = status;
    if (status === ProblemStatus.Resolved) {
      doc.resolvedAt = new Date();
    } else if (doc.resolvedAt) {
      doc.resolvedAt = undefined;
    }
    await doc.save();
    if (prev !== status) {
      await this.notifications.create({
        recipientId: doc.author.toString(),
        kind: 'problem_status_changed',
        problemId: doc._id.toString(),
        problemTitle: doc.title,
        message: `Status changed: ${prev} → ${status}`,
      });
    }
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
