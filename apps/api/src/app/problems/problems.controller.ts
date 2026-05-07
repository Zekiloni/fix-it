import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  AssignProblemDto,
  assignProblemSchema,
  CreateProblemDto,
  createProblemSchema,
  IProblem,
  ProblemCategory,
  ProblemStatus,
  RouteProblemDto,
  routeProblemSchema,
  UpdateProblemDto,
  updateProblemSchema,
  UpdateProblemStatusDto,
  updateProblemStatusSchema,
  UserRole,
} from '@fix-it/shared';
import { ZodValidationPipe } from '../common/pipes';
import { RequestActor } from '../common/request-actor';
import { CurrentUser, Public, Roles } from '../auth/decorators';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly service: ProblemsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createProblemSchema)) dto: CreateProblemDto,
    @CurrentUser() actor: RequestActor,
  ): Promise<IProblem> {
    return this.service.create(dto, actor.userId);
  }

  @Public()
  @Get()
  findAll(
    @Query('status') status?: ProblemStatus,
    @Query('category') category?: ProblemCategory,
    @Query('organizationId') organizationId?: string,
    @Query('authorId') authorId?: string,
    @Query('assigneeId') assigneeId?: string,
  ): Promise<IProblem[]> {
    return this.service.findAll({
      status,
      category,
      organizationId,
      authorId,
      assigneeId,
    });
  }

  @Public()
  @Get('nearby')
  findNearby(
    @Query('lng') lng: string,
    @Query('lat') lat: string,
    @Query('radius') radius: string,
    @Query('limit') limit?: string,
  ): Promise<IProblem[]> {
    const lngN = Number(lng);
    const latN = Number(lat);
    const radiusN = Number(radius);
    if (!Number.isFinite(lngN) || !Number.isFinite(latN) || !Number.isFinite(radiusN)) {
      throw new BadRequestException('lng, lat, radius must be numeric');
    }
    return this.service.findNearby({
      lng: lngN,
      lat: latN,
      radiusMeters: radiusN,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<IProblem> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProblemSchema)) dto: UpdateProblemDto,
    @CurrentUser() actor: RequestActor,
  ): Promise<IProblem> {
    return this.service.update(id, dto, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() actor: RequestActor,
  ): Promise<void> {
    return this.service.remove(id, actor);
  }

  @Roles(UserRole.Admin)
  @Patch(':id/route')
  route(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(routeProblemSchema)) dto: RouteProblemDto,
  ): Promise<IProblem> {
    return this.service.routeTo(id, dto.organizationId);
  }

  @Roles(UserRole.Admin, UserRole.Operator)
  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(assignProblemSchema)) dto: AssignProblemDto,
  ): Promise<IProblem> {
    return this.service.assignTo(id, dto.assigneeId);
  }

  @Roles(UserRole.Admin, UserRole.Operator)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProblemStatusSchema))
    dto: UpdateProblemStatusDto,
    @CurrentUser() actor: RequestActor,
  ): Promise<IProblem> {
    return this.service.updateStatus(id, dto.status, actor);
  }
}
