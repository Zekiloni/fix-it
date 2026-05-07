'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

interface IconAsset {
  src?: string;
}
const resolve = (asset: string | IconAsset): string =>
  typeof asset === 'string' ? asset : asset.src ?? '';

const DefaultIconProto = L.Icon.Default.prototype as { _getIconUrl?: unknown };
delete DefaultIconProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: resolve(iconUrl as unknown as string | IconAsset),
  iconRetinaUrl: resolve(iconRetinaUrl as unknown as string | IconAsset),
  shadowUrl: resolve(shadowUrl as unknown as string | IconAsset),
});

export interface PickedLocation {
  lng: number;
  lat: number;
}

interface MapClickHandlerProps {
  onPick: (loc: PickedLocation) => void;
}

function MapClickHandler({ onPick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => onPick({ lng: e.latlng.lng, lat: e.latlng.lat }),
  });
  return null;
}

interface FlyToProps {
  center: PickedLocation | null;
  zoom: number;
}

function FlyTo({ center, zoom }: FlyToProps) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 0.5 });
    }
  }, [center, zoom, map]);
  return null;
}

interface ProblemPickerMapClientProps {
  value: PickedLocation | null;
  onChange: (loc: PickedLocation) => void;
  defaultCenter: PickedLocation;
  defaultZoom?: number;
}

export default function ProblemPickerMapClient({
  value,
  onChange,
  defaultCenter,
  defaultZoom = 13,
}: ProblemPickerMapClientProps) {
  const center = value ?? defaultCenter;
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onPick={onChange} />
      <FlyTo center={value} zoom={defaultZoom} />
      {value && <Marker position={[value.lat, value.lng]} />}
    </MapContainer>
  );
}
