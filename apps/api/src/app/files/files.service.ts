import {
  BadRequestException,
  Inject,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAttachment } from '@fix-it/shared';
import { FILE_STORAGE, FileStorage } from './storage/file-storage.interface';

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

interface UploadInput {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class FilesService {
  private readonly maxBytes: number;

  constructor(
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
    config: ConfigService,
  ) {
    const configured = Number(config.get<string>('MAX_UPLOAD_BYTES'));
    this.maxBytes = Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_MAX_BYTES;
  }

  async upload(input: UploadInput): Promise<IAttachment> {
    this.assertAllowed(input);
    const saved = await this.storage.save({
      buffer: input.buffer,
      mimeType: input.mimeType,
      originalName: input.originalName,
    });
    return {
      storageId: saved.storageId,
      url: saved.url,
      mimeType: input.mimeType,
      sizeBytes: saved.sizeBytes,
      originalName: input.originalName,
      uploadedAt: new Date(),
    };
  }

  async delete(storageId: string): Promise<void> {
    await this.storage.delete(storageId);
  }

  private assertAllowed(input: UploadInput): void {
    if (!input.buffer || input.buffer.byteLength === 0) {
      throw new BadRequestException('Empty file');
    }
    if (input.buffer.byteLength > this.maxBytes) {
      throw new PayloadTooLargeException(
        `File exceeds ${this.maxBytes} bytes`,
      );
    }
    if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new BadRequestException(
        `Unsupported file type: ${input.mimeType}`,
      );
    }
  }
}
