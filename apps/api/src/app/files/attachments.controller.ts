import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IProblem } from '@fix-it/shared';
import { CurrentUser } from '../auth/decorators';
import { RequestActor } from '../common/request-actor';
import { ProblemsService } from '../problems/problems.service';
import { FilesService } from './files.service';

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@Controller('problems/:id/attachments')
export class AttachmentsController {
  constructor(
    private readonly problems: ProblemsService,
    private readonly files: FilesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id') problemId: string,
    @UploadedFile() file: MulterFile | undefined,
    @CurrentUser() actor: RequestActor,
  ): Promise<IProblem> {
    if (!file) throw new BadRequestException('Missing "file" field');
    const attachment = await this.files.upload({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
    try {
      return await this.problems.addAttachment(problemId, attachment, actor);
    } catch (err) {
      // Roll back the orphan blob if attaching fails (404, 403, etc.).
      await this.files.delete(attachment.storageId).catch(() => undefined);
      throw err;
    }
  }

  @Delete(':storageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') problemId: string,
    @Param('storageId') storageId: string,
    @CurrentUser() actor: RequestActor,
  ): Promise<void> {
    const result = await this.problems.removeAttachment(
      problemId,
      storageId,
      actor,
    );
    if (!result.removedStorageId) {
      throw new NotFoundException(`Attachment ${storageId} not found`);
    }
    await this.files.delete(result.removedStorageId);
  }
}
