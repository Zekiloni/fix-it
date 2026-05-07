'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — react-leaflet-cluster ships its own TS but pulls Marker types tightly
import MarkerClusterGroup from 'react-leaflet-cluster';
import { type IProblem, ProblemStatus } from '@fix-it/shared';
import { statusVisuals } from '../lib/status-colors';

const buildIcon = (status: ProblemStatus): L.DivIcon =>
  L.divIcon({
    className: 'cityfix-pin',
    html: `<span style="background:${statusVisuals[status].bg}" class="block h-4 w-4 rounded-full border-2 border-white shadow-md"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });

interface FitBoundsProps {
  problems: IProblem[];
  fallbackCenter: [number, number];
  fallbackZoom: number;
}

function FitBounds({ problems, fallbackCenter, fallbackZoom }: FitBoundsProps) {
  const map = useMap();
  useEffect(() => {
    if (problems.length === 0) {
      map.setView(fallbackCenter, fallbackZoom);
      return;
    }
    if (problems.length === 1) {
      const [lng, lat] = problems[0].location.coordinates;
      map.setView([lat, lng], 14);
      return;
    }
    const bounds = L.latLngBounds(
      problems.map((p) => {
        const [lng, lat] = p.location.coordinates;
        return [lat, lng];
      }),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [problems, map, fallbackCenter, fallbackZoom]);
  return null;
}

interface ProblemsMapClientProps {
  problems: IProblem[];
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
}

export default function ProblemsMapClient({
  problems,
  fallbackCenter = [44.7866, 20.4489],
  fallbackZoom = 12,
}: ProblemsMapClientProps) {
  const icons = useMemo(() => {
    const out: Record<ProblemStatus, L.DivIcon> = {
      [ProblemStatus.Reported]: buildIcon(ProblemStatus.Reported),
      [ProblemStatus.Acknowledged]: buildIcon(ProblemStatus.Acknowledged),
      [ProblemStatus.InProgress]: buildIcon(ProblemStatus.InProgress),
      [ProblemStatus.Resolved]: buildIcon(ProblemStatus.Resolved),
      [ProblemStatus.Rejected]: buildIcon(ProblemStatus.Rejected),
    };
    return out;
  }, []);

  return (
    <MapContainer
      center={fallbackCenter}
      zoom={fallbackZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds
        problems={problems}
        fallbackCenter={fallbackCenter}
        fallbackZoom={fallbackZoom}
      />
      <MarkerClusterGroup chunkedLoading>
        {problems.map((p) => {
          const [lng, lat] = p.location.coordinates;
          return (
            <Marker key={p.id} position={[lat, lng]} icon={icons[p.status]}>
              <Popup>
                <div className="space-y-1">
                  <a
                    href={`/problems/${p.id}`}
                    className="block font-semibold underline-offset-4 hover:underline"
                  >
                    {p.title}
                  </a>
                  <p className="text-xs text-gray-500 capitalize">
                    {p.category} · {statusVisuals[p.status].label}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
