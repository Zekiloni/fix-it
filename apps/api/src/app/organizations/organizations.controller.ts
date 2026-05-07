import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateOrganizationDto,
  createOrganizationSchema,
  IOrganization,
  UpdateOrganizationDto,
  updateOrganizationSchema,
} from '@fix-it/shared';
import { ZodValidationPipe } from '../common/pipes';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createOrganizationSchema))
    dto: CreateOrganizationDto,
  ): Promise<IOrganization> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<IOrganization[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IOrganization> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOrganizationSchema))
    dto: UpdateOrganizationDto,
  ): Promise<IOrganization> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
