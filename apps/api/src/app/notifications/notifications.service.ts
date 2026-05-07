import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  INotification,
  NotificationKind,
} from '@fix-it/shared';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

const toNotification = (doc: NotificationDocument): INotification => ({
  id: doc._id.toString(),
  recipientId: doc.recipient.toString(),
  kind: doc.kind,
  problemId: doc.problem.toString(),
  problemTitle: doc.problemTitle,
  message: doc.message,
  read: doc.read,
  createdAt: (doc as unknown as { createdAt: Date }).createdAt,
});

interface CreateInput {
  recipientId: string;
  kind: NotificationKind;
  problemId: string;
  problemTitle: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  private readonly log = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly model: Model<NotificationDocument>,
  ) {}

  async create(input: CreateInput): Promise<void> {
    await this.model.create({
      recipient: new Types.ObjectId(input.recipientId),
      kind: input.kind,
      problem: new Types.ObjectId(input.problemId),
      problemTitle: input.problemTitle,
      message: input.message,
      read: false,
    });
    this.log.log(
      `[notify] ${input.kind} → user ${input.recipientId}: ${input.message}`,
    );
  }

  async listFor(userId: string): Promise<INotification[]> {
    const docs = await this.model
      .find({ recipient: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return docs.map(toNotification);
  }

  async unreadCount(userId: string): Promise<number> {
    return this.model
      .countDocuments({
        recipient: new Types.ObjectId(userId),
        read: false,
      })
      .exec();
  }

  async markAllRead(userId: string): Promise<void> {
    await this.model
      .updateMany(
        { recipient: new Types.ObjectId(userId), read: false },
        { $set: { read: true } },
      )
      .exec();
  }
}
