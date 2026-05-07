import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@fix-it/shared';

export interface RequestActor {
  userId: string;
  role: UserRole;
}

interface AuthedRequest {
  user?: RequestActor;
}

export const requireActor = (req: AuthedRequest): RequestActor => {
  if (!req.user) throw new UnauthorizedException('Authentication required');
  return req.user;
};
