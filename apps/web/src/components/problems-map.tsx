'use client';

import dynamic from 'next/dynamic';
import type { IProblem } from '@fix-it/shared';

const Inner = dynamic(() => import('./problems-map.client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

interface ProblemsMapProps {
  problems: IProblem[];
  className?: string;
}

export function ProblemsMap({ problems, className }: ProblemsMapProps) {
  return (
    <div
      className={
        className ?? 'h-[420px] w-full overflow-hidden rounded-md border'
      }
    >
      <Inner problems={problems} />
    </div>
  );
}
