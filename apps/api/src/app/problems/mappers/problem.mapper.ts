import { IAttachment, IProblem } from '@fix-it/shared';
import { ProblemDocument } from '../schemas/problem.schema';
import { AttachmentSchemaClass } from '../schemas/attachment.schema';

const toAttachment = (a: AttachmentSchemaClass): IAttachment => ({
  url: a.url,
  mimeType: a.mimeType,
  sizeBytes: a.sizeBytes,
  originalName: a.originalName,
  uploadedAt: (a as unknown as { uploadedAt: Date }).uploadedAt,
});

export const toProblem = (doc: ProblemDocument): IProblem => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  category: doc.category,
  status: doc.status,
  location: {
    type: 'Point',
    coordinates: [doc.location.coordinates[0], doc.location.coordinates[1]],
  },
  address: doc.address,
  attachments: (doc.attachments ?? []).map(toAttachment),
  authorId: doc.author.toString(),
  organizationId: doc.organization?.toString(),
  assigneeId: doc.assignee?.toString(),
  createdAt: (doc as unknown as { createdAt: Date }).createdAt,
  updatedAt: (doc as unknown as { updatedAt: Date }).updatedAt,
  resolvedAt: doc.resolvedAt,
});
