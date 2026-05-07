'use client';

import { useRef, useState, useTransition } from 'react';
import { Button, Input } from '@fix-it/ui';
import { Upload } from 'lucide-react';
import { uploadAttachmentAction } from '../lib/actions/attachments';

interface AttachmentUploaderProps {
  problemId: string;
}

export function AttachmentUploader({ problemId }: AttachmentUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await uploadAttachmentAction(problemId, data);
      if (!res.ok) setError(res.error ?? 'Upload failed');
      else formRef.current?.reset();
    });
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <Input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" disabled={pending} size="sm">
        <Upload className="h-4 w-4" />
        {pending ? 'Uploading…' : 'Upload'}
      </Button>
    </form>
  );
}
