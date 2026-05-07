import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IOrganization, ProblemCategory } from '@fix-it/shared';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ timestamps: true, collection: 'organizations' })
export class Organization
  implements Omit<IOrganization, 'id' | 'createdAt' | 'updatedAt'>
{
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/,
    index: true,
  })
  slug!: string;

  @Prop({ trim: true, maxlength: 1000 })
  description?: string;

  @Prop({ required: true, lowercase: true, trim: true })
  contactEmail!: string;

  @Prop({
    type: [String],
    enum: Object.values(ProblemCategory),
    default: [],
    index: true,
  })
  categories!: ProblemCategory[];
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r['id'] = r['_id'];
    delete r['_id'];
    return r;
  },
});
