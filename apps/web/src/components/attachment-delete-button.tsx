'use client';

import { useState, useTransition } from 'react';
import { Button } from '@fix-it/ui';
import { Trash2 } from 'lucide-react';
import { deleteAttachmentAction } from '../lib/actions/attachments';

interface AttachmentDeleteButtonProps {
  problemId: string;
  storageId: string;
}

export function AttachmentDeleteButton({
  problemId,
  storageId,
}: AttachmentDeleteButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    if (!confirm('Delete this attachment?')) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAttachmentAction(problemId, storageId);
      if (!res.ok) setError(res.error ?? 'Delete failed');
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={onClick}
        aria-label="Delete attachment"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
