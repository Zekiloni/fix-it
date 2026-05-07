import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import {
  IAuthResponse,
  IUser,
  LoginDto,
  loginSchema,
  RegisterDto,
  registerSchema,
} from '@fix-it/shared';
import { ZodValidationPipe } from '../common/pipes';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';
import { GoogleAuthGuard, LocalAuthGuard } from './guards';
import { UsersService } from '../users/users.service';
import { RequestActor } from '../common/request-actor';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
  ): Promise<IAuthResponse> {
    return this.auth.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Body(new ZodValidationPipe(loginSchema)) _dto: LoginDto,
    @Req() req: { user: IUser },
  ): IAuthResponse {
    return this.auth.issue(req.user);
  }

  @Get('me')
  me(@CurrentUser() actor: RequestActor): Promise<IUser> {
    return this.users.findById(actor.userId);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleStart(): void {
    // Passport redirects to Google.
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(
    @Req() req: { user: IUser },
    @Res() res: Response,
  ): void {
    const { accessToken } = this.auth.issue(req.user);
    const webOrigin =
      this.config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';
    const target = `${webOrigin}/auth/callback?token=${encodeURIComponent(accessToken)}`;
    res.redirect(target);
  }
}
