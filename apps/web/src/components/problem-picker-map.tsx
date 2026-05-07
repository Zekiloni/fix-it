'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@fix-it/ui';
import { Crosshair, Loader2 } from 'lucide-react';

const ProblemPickerMapClient = dynamic(
  () => import('./problem-picker-map.client'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

export interface PickedLocation {
  lng: number;
  lat: number;
}

interface ProblemPickerMapProps {
  value: PickedLocation | null;
  onChange: (loc: PickedLocation) => void;
  defaultCenter?: PickedLocation;
}

const DEFAULT_CENTER: PickedLocation = { lng: 20.4489, lat: 44.7866 };

export function ProblemPickerMap({
  value,
  onChange,
  defaultCenter = DEFAULT_CENTER,
}: ProblemPickerMapProps) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const useCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation not supported in this browser');
      return;
    }
    setGeoError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setLocating(false);
      },
      (err) => {
        setGeoError(err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {value
            ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
            : 'Click the map to drop a pin.'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useCurrentLocation}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
          Use current location
        </Button>
      </div>
      {geoError && <p className="text-sm text-destructive">{geoError}</p>}
      <div className="h-[360px] w-full overflow-hidden rounded-md border">
        <ProblemPickerMapClient
          value={value}
          onChange={onChange}
          defaultCenter={defaultCenter}
        />
      </div>
    </div>
  );
}
