import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  IUser,
  SetUserOrganizationDto,
  setUserOrganizationSchema,
  SetUserRoleDto,
  setUserRoleSchema,
  UserRole,
} from '@fix-it/shared';
import { Roles } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import { UsersService } from './users.service';

@Roles(UserRole.Admin)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(): Promise<IUser[]> {
    return this.users.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IUser> {
    return this.users.findById(id);
  }

  @Patch(':id/role')
  setRole(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(setUserRoleSchema)) dto: SetUserRoleDto,
  ): Promise<IUser> {
    return this.users.setRole(id, dto.role);
  }

  @Patch(':id/organization')
  setOrganization(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(setUserOrganizationSchema))
    dto: SetUserOrganizationDto,
  ): Promise<IUser> {
    return this.users.assignOrganization(id, dto.organizationId);
  }
}
