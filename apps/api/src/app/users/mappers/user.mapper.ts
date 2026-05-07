import { IUser } from '@fix-it/shared';
import { UserDocument } from '../schemas/user.schema';

export const toUser = (doc: UserDocument): IUser => ({
  id: doc._id.toString(),
  email: doc.email,
  name: doc.name,
  role: doc.role,
  organizationId: doc.organization?.toString(),
  avatarUrl: doc.avatarUrl,
  googleId: doc.googleId,
  createdAt: (doc as unknown as { createdAt: Date }).createdAt,
  updatedAt: (doc as unknown as { updatedAt: Date }).updatedAt,
});
