import { FileText } from 'lucide-react';
import type { IAttachment } from '@fix-it/shared';
import { resolveAssetUrl } from '../lib/asset-url';
import { AttachmentDeleteButton } from './attachment-delete-button';

interface AttachmentGridProps {
  problemId: string;
  attachments: IAttachment[];
  canDelete: boolean;
}

export function AttachmentGrid({
  problemId,
  attachments,
  canDelete,
}: AttachmentGridProps) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No attachments yet.</p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {attachments.map((a) => {
        const url = resolveAssetUrl(a.url);
        const isImage = a.mimeType.startsWith('image/');
        return (
          <li
            key={a.storageId}
            className="group relative overflow-hidden rounded-md border bg-muted"
          >
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block aspect-square"
            >
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={a.originalName}
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-muted-foreground">
                  <FileText className="h-10 w-10" />
                  <span className="line-clamp-2 text-center text-xs">
                    {a.originalName}
                  </span>
                </div>
              )}
            </a>
            {canDelete && (
              <div className="absolute right-1 top-1 rounded-md bg-background/80 backdrop-blur">
                <AttachmentDeleteButton
                  problemId={problemId}
                  storageId={a.storageId}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
