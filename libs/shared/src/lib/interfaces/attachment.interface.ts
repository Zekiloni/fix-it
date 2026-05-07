export interface IAttachment {
  storageId: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
  uploadedAt: Date;
}
