'use client';

import * as React from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
}

const normalize = (raw: string): string =>
  raw.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 40);

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag, press Enter',
  max = 10,
}: TagInputProps) {
  const [draft, setDraft] = React.useState('');

  const commit = () => {
    const tag = normalize(draft);
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft('');
      return;
    }
    if (value.length >= max) return;
    onChange([...value, tag]);
    setDraft('');
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-ring">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            aria-label={`Remove tag ${tag}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
