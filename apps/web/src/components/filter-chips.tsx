'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { ProblemCategory, ProblemStatus } from '@fix-it/shared';
import { allStatuses, statusVisuals } from '../lib/status-colors';

const categoryLabels: Record<ProblemCategory, string> = {
  [ProblemCategory.Road]: 'Road',
  [ProblemCategory.Lighting]: 'Lighting',
  [ProblemCategory.Waste]: 'Waste',
  [ProblemCategory.Water]: 'Water',
  [ProblemCategory.Vandalism]: 'Vandalism',
  [ProblemCategory.Greenery]: 'Greenery',
  [ProblemCategory.Other]: 'Other',
};

interface FilterChipsProps {
  showStatus?: boolean;
  showCategory?: boolean;
}

export function FilterChips({
  showStatus = true,
  showCategory = true,
}: FilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const activeStatus = params.get('status') as ProblemStatus | null;
  const activeCategory = params.get('category') as ProblemCategory | null;

  const setParam = (key: 'status' | 'category', value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    });
  };

  return (
    <div
      className={`space-y-3 ${pending ? 'opacity-60' : ''}`}
      aria-busy={pending}
    >
      {showStatus && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </span>
          {allStatuses.map((s) => {
            const v = statusVisuals[s];
            const isActive = activeStatus === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setParam('status', isActive ? null : s)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-transparent text-white'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
                style={
                  isActive ? { backgroundColor: v.bg, color: v.fg } : undefined
                }
              >
                {v.label}
              </button>
            );
          })}
        </div>
      )}

      {showCategory && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Category
          </span>
          {Object.values(ProblemCategory).map((c) => {
            const isActive = activeCategory === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setParam('category', isActive ? null : c)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
              >
                {categoryLabels[c]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
