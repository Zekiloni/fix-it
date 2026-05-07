'use client';

import { useState, useTransition } from 'react';
import { Button, Input } from '@fix-it/ui';
import { Loader2, Search } from 'lucide-react';
import { forwardGeocode } from '../lib/geocoding';

interface AddressSearchBarProps {
  onPick: (location: { lng: number; lat: number; displayName: string }) => void;
}

export function AddressSearchBar({ onPick }: AddressSearchBarProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const search = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      try {
        const results = await forwardGeocode(trimmed);
        if (results.length === 0) {
          setError('No matches found');
          return;
        }
        const first = results[0];
        onPick({
          lng: first.lng,
          lat: first.lat,
          displayName: first.displayName,
        });
      } catch {
        setError('Search failed');
      }
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Search by address (e.g. Knez Mihailova 6, Beograd)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              search();
            }
          }}
          disabled={pending}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={search}
          disabled={pending}
          aria-label="Search address"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
