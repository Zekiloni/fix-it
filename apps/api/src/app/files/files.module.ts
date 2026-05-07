import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProblemsModule } from '../problems/problems.module';
import { AttachmentsController } from './attachments.controller';
import { FilesService } from './files.service';
import { FILE_STORAGE } from './storage/file-storage.interface';
import { LocalFileStorage } from './storage/local.storage';

const fileStorageProvider: Provider = {
  provide: FILE_STORAGE,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const driver = config.get<string>('STORAGE_DRIVER') ?? 'local';
    switch (driver) {
      case 'local':
        return new LocalFileStorage(config);
      // case 's3': return new S3FileStorage(config);
      // case 'cloudinary': return new CloudinaryFileStorage(config);
      default:
        throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
    }
  },
};

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const max = Number(config.get<string>('MAX_UPLOAD_BYTES'));
        return {
          storage: memoryStorage(),
          limits: {
            fileSize:
              Number.isFinite(max) && max > 0 ? max : 10 * 1024 * 1024,
          },
        };
      },
    }),
    ProblemsModule,
  ],
  controllers: [AttachmentsController],
  providers: [FilesService, fileStorageProvider],
  exports: [FilesService],
})
export class FilesModule {}
