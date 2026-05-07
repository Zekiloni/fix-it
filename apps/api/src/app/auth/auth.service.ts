import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthResponse, IUser, RegisterDto } from '@fix-it/shared';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<IAuthResponse> {
    const user = await this.users.createWithPassword(dto);
    return this.issue(user);
  }

  async validateLocal(email: string, password: string): Promise<IUser | null> {
    return this.users.verifyPassword(email, password);
  }

  async validateGoogle(input: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<IUser> {
    return this.users.findOrCreateFromGoogle(input);
  }

  issue(user: IUser): IAuthResponse {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user,
    };
  }
}
