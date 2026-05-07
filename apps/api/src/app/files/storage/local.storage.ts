import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, isAbsolute, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  FileStorage,
  SaveFileInput,
  SavedFile,
} from './file-storage.interface';

const STATIC_PREFIX = '/uploads';

@Injectable()
export class LocalFileStorage implements FileStorage {
  private readonly log = new Logger(LocalFileStorage.name);
  private readonly rootDir: string;

  constructor(config: ConfigService) {
    const configured = config.get<string>('LOCAL_UPLOADS_DIR') ?? './uploads';
    this.rootDir = isAbsolute(configured)
      ? configured
      : resolve(process.cwd(), configured);
    if (!existsSync(this.rootDir)) {
      this.log.log(`Creating uploads dir: ${this.rootDir}`);
    }
  }

  async save(input: SaveFileInput): Promise<SavedFile> {
    await mkdir(this.rootDir, { recursive: true });
    const ext = extname(input.originalName).toLowerCase();
    const storageId = `${randomUUID()}${ext}`;
    const fullPath = join(this.rootDir, storageId);
    await writeFile(fullPath, input.buffer);
    return {
      storageId,
      url: `${STATIC_PREFIX}/${storageId}`,
      sizeBytes: input.buffer.byteLength,
    };
  }

  async delete(storageId: string): Promise<void> {
    const fullPath = join(this.rootDir, storageId);
    try {
      await unlink(fullPath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }

  get directory(): string {
    return this.rootDir;
  }

  static staticPrefix(): string {
    return STATIC_PREFIX;
  }
}
