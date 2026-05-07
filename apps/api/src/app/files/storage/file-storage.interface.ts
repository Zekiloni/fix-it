export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface SaveFileInput {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export interface SavedFile {
  storageId: string;
  url: string;
  sizeBytes: number;
}

export interface FileStorage {
  save(input: SaveFileInput): Promise<SavedFile>;
  delete(storageId: string): Promise<void>;
}
