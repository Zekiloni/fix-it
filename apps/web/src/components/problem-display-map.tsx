'use client';

import dynamic from 'next/dynamic';

const Inner = dynamic(() => import('./problem-display-map.client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

interface ProblemDisplayMapProps {
  lng: number;
  lat: number;
  zoom?: number;
}

export function ProblemDisplayMap(props: ProblemDisplayMapProps) {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-md border">
      <Inner {...props} />
    </div>
  );
}
