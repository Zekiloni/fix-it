'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@fix-it/ui';
import { Loader2, Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
}

const DEBOUNCE_MS = 300;

export function SearchBar({
  placeholder = 'Search problems…',
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const initial = params.get('q') ?? '';
  const [value, setValue] = useState(initial);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  const push = (q: string) => {
    const next = new URLSearchParams(params.toString());
    if (q) next.set('q', q);
    else next.delete('q');
    const qs = next.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    });
  };

  const onChange = (next: string) => {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(next.trim()), DEBOUNCE_MS);
  };

  const clear = () => {
    setValue('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    push('');
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        aria-label="Search problems"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
