'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

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

interface ProblemDisplayMapClientProps {
  lng: number;
  lat: number;
  zoom?: number;
}

export default function ProblemDisplayMapClient({
  lng,
  lat,
  zoom = 15,
}: ProblemDisplayMapClientProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} />
    </MapContainer>
  );
}
