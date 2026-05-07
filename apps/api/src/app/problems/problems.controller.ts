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
  Req,
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
} from '@fix-it/shared';
import { ZodValidationPipe } from '../common/pipes';
import { requireActor } from '../common/request-actor';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly service: ProblemsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createProblemSchema)) dto: CreateProblemDto,
    @Req() req: Parameters<typeof requireActor>[0],
  ): Promise<IProblem> {
    const actor = requireActor(req);
    return this.service.create(dto, actor.userId);
  }

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

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IProblem> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProblemSchema)) dto: UpdateProblemDto,
    @Req() req: Parameters<typeof requireActor>[0],
  ): Promise<IProblem> {
    return this.service.update(id, dto, requireActor(req));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Req() req: Parameters<typeof requireActor>[0],
  ): Promise<void> {
    return this.service.remove(id, requireActor(req));
  }

  @Patch(':id/route')
  route(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(routeProblemSchema)) dto: RouteProblemDto,
  ): Promise<IProblem> {
    return this.service.routeTo(id, dto.organizationId);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(assignProblemSchema)) dto: AssignProblemDto,
  ): Promise<IProblem> {
    return this.service.assignTo(id, dto.assigneeId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProblemStatusSchema))
    dto: UpdateProblemStatusDto,
    @Req() req: Parameters<typeof requireActor>[0],
  ): Promise<IProblem> {
    return this.service.updateStatus(id, dto.status, requireActor(req));
  }
}
