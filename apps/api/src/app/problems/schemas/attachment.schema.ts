import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IAttachment } from '@fix-it/shared';

@Schema({ _id: false, timestamps: { createdAt: 'uploadedAt', updatedAt: false } })
export class AttachmentSchemaClass implements Omit<IAttachment, 'uploadedAt'> {
  @Prop({ required: true, index: true })
  storageId!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  sizeBytes!: number;

  @Prop({ required: true })
  originalName!: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(AttachmentSchemaClass);
