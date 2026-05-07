'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, buttonVariants, cn } from '@fix-it/ui';
import { deleteProblemAction } from '../lib/actions/problems';

interface ProblemActionsProps {
  problemId: string;
}

export function ProblemActions({ problemId }: ProblemActionsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onDelete = () => {
    if (!confirm('Delete this problem? This cannot be undone.')) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteProblemAction(problemId);
      if (!res.ok) setError(res.error ?? 'Delete failed');
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Link
          href={`/problems/${problemId}/edit`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={pending}
        >
          <Trash2 className="h-4 w-4" />
          {pending ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
