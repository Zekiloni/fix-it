import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import {
  INotification,
  NotificationKind,
} from '@fix-it/shared';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'notifications' })
export class Notification
  implements
    Omit<INotification, 'id' | 'createdAt' | 'recipientId' | 'problemId'>
{
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  recipient!: Types.ObjectId;

  @Prop({ required: true, type: String })
  kind!: NotificationKind;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  problem!: Types.ObjectId;

  @Prop({ required: true })
  problemTitle!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ default: false, index: true })
  read!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r['id'] = r['_id'];
    r['recipientId'] = r['recipient'];
    r['problemId'] = r['problem'];
    delete r['_id'];
    delete r['recipient'];
    delete r['problem'];
    return r;
  },
});
