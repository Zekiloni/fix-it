import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { IUser, UserRole } from '@fix-it/shared';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User
  implements
    Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>
{
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.User,
    index: true,
  })
  role!: UserRole;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  })
  organization?: Types.ObjectId;

  @Prop()
  avatarUrl?: string;

  @Prop({ unique: true, sparse: true, index: true })
  googleId?: string;

  @Prop({ select: false })
  passwordHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r['id'] = r['_id'];
    if (r['organization']) {
      r['organizationId'] = r['organization'];
    }
    delete r['_id'];
    delete r['organization'];
    delete r['googleId'];
    delete r['passwordHash'];
    return r;
  },
});
