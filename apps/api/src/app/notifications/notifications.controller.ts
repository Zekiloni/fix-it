import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { INotification } from '@fix-it/shared';
import { CurrentUser } from '../auth/decorators';
import { RequestActor } from '../common/request-actor';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  list(@CurrentUser() actor: RequestActor): Promise<INotification[]> {
    return this.service.listFor(actor.userId);
  }

  @Get('unread-count')
  async unreadCount(
    @CurrentUser() actor: RequestActor,
  ): Promise<{ count: number }> {
    return { count: await this.service.unreadCount(actor.userId) };
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  markAllRead(@CurrentUser() actor: RequestActor): Promise<void> {
    return this.service.markAllRead(actor.userId);
  }
}
