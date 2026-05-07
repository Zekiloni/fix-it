import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { RequestActor } from '../../common/request-actor';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestActor => {
    const req = ctx.switchToHttp().getRequest<{ user?: RequestActor }>();
    if (!req.user) {
      throw new Error(
        'CurrentUser decorator used on an unprotected route — add JwtAuthGuard or remove @Public()',
      );
    }
    return req.user;
  },
);
