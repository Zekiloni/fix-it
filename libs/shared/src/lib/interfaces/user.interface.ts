import { UserRole } from '../enums/user-role.enum';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  avatarUrl?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<IUser, 'googleId'>;
