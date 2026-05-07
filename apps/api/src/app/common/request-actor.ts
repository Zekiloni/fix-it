import { UserRole } from '@fix-it/shared';

export interface RequestActor {
  userId: string;
  role: UserRole;
}
