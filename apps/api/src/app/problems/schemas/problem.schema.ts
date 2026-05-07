import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import {
  IProblem,
  ProblemCategory,
  ProblemStatus,
} from '@fix-it/shared';
import {
  GeoPointSchema,
  GeoPointSchemaClass,
} from './geo-point.schema';
import {
  AttachmentSchema,
  AttachmentSchemaClass,
} from './attachment.schema';

export type ProblemDocument = HydratedDocument<Problem>;

@Schema({ timestamps: true, collection: 'problems' })
export class Problem
  implements
    Omit<
      IProblem,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'authorId'
      | 'organizationId'
      | 'assigneeId'
      | 'location'
      | 'attachments'
    >
{

  @Prop({ required: true, trim: true, minlength: 5, maxlength: 120 })
  title!: string;

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 2000 })
  description!: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ProblemCategory),
    index: true,
  })
  category!: ProblemCategory;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ProblemStatus),
    default: ProblemStatus.Reported,
    index: true,
  })
  status!: ProblemStatus;

  @Prop({ type: GeoPointSchema, required: true })
  location!: GeoPointSchemaClass;

  @Prop({ trim: true, maxlength: 300 })
  address?: string;

  @Prop({ trim: true, maxlength: 30 })
  contactPhone?: string;

  @Prop({ type: [AttachmentSchema], default: [] })
  attachments!: AttachmentSchemaClass[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  author!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  })
  organization?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  assignee?: Types.ObjectId;

  @Prop()
  resolvedAt?: Date;
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);

// 2dsphere enables $near, $geoWithin, and clustering on the map.
ProblemSchema.index({ location: '2dsphere' });

// Dashboard filter: status + category, newest first.
ProblemSchema.index({ status: 1, category: 1, createdAt: -1 });

// Org-scoped operator queue lookups.
ProblemSchema.index({ organization: 1, status: 1, createdAt: -1 });

ProblemSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r['id'] = r['_id'];
    r['authorId'] = r['author'];
    if (r['organization']) {
      r['organizationId'] = r['organization'];
    }
    if (r['assignee']) {
      r['assigneeId'] = r['assignee'];
    }
    delete r['_id'];
    delete r['author'];
    delete r['organization'];
    delete r['assignee'];
    return r;
  },
});
