'use client';

import { useRef, useState, useTransition } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@fix-it/ui';

interface PhotoLocationExtractorProps {
  onExtract: (location: { lng: number; lat: number }) => void;
}

export function PhotoLocationExtractor({ onExtract }: PhotoLocationExtractorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onChoose = () => inputRef.current?.click();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const exifr = await import('exifr');
        const data = await exifr.default.gps(file);
        if (!data || typeof data.latitude !== 'number') {
          setError('No GPS data in this photo.');
          return;
        }
        onExtract({ lng: data.longitude, lat: data.latitude });
      } catch {
        setError('Could not read EXIF.');
      } finally {
        if (inputRef.current) inputRef.current.value = '';
      }
    });
  };

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/heic,image/heif"
        onChange={onFile}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onChoose}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        Use photo&apos;s GPS
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
