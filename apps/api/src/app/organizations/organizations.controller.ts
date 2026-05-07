import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateOrganizationDto,
  createOrganizationSchema,
  IOrganization,
  IUser,
  UpdateOrganizationDto,
  updateOrganizationSchema,
  UserRole,
} from '@fix-it/shared';
import { ZodValidationPipe } from '../common/pipes';
import { Public, Roles } from '../auth/decorators';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly service: OrganizationsService,
    @Inject(forwardRef(() => UsersService))
    private readonly users: UsersService,
  ) {}

  @Roles(UserRole.Admin)
  @Post()
  create(
    @Body(new ZodValidationPipe(createOrganizationSchema))
    dto: CreateOrganizationDto,
  ): Promise<IOrganization> {
    return this.service.create(dto);
  }

  @Public()
  @Get()
  findAll(): Promise<IOrganization[]> {
    return this.service.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<IOrganization> {
    return this.service.findOne(id);
  }

  @Roles(UserRole.Admin, UserRole.Operator)
  @Get(':id/operators')
  async listOperators(@Param('id') id: string): Promise<IUser[]> {
    await this.service.findOne(id);
    return this.users.findOperators(id);
  }

  @Roles(UserRole.Admin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOrganizationSchema))
    dto: UpdateOrganizationDto,
  ): Promise<IOrganization> {
    return this.service.update(id, dto);
  }

  @Roles(UserRole.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
