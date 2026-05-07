const NOMINATIM = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'CityFix/0.1 (dev)';

export interface ReverseGeocodeResult {
  displayName: string;
  road?: string;
  houseNumber?: string;
  city?: string;
  country?: string;
}

export interface ForwardGeocodeResult {
  displayName: string;
  lng: number;
  lat: number;
}

interface NominatimReverseResponse {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
  error?: string;
}

interface NominatimForwardItem {
  display_name: string;
  lat: string;
  lon: string;
}

export async function reverseGeocode(
  lng: number,
  lat: number,
  signal?: AbortSignal,
): Promise<ReverseGeocodeResult | null> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
    signal,
  });
  if (!res.ok) return null;
  const json = (await res.json()) as NominatimReverseResponse;
  if (!json.display_name) return null;
  const addr = json.address ?? {};
  return {
    displayName: json.display_name,
    road: addr.road ?? addr.pedestrian,
    houseNumber: addr.house_number,
    city: addr.city ?? addr.town ?? addr.village,
    country: addr.country,
  };
}

export function shortAddress(r: ReverseGeocodeResult): string {
  const parts: string[] = [];
  if (r.road) {
    parts.push(r.houseNumber ? `${r.road} ${r.houseNumber}` : r.road);
  }
  if (r.city) parts.push(r.city);
  if (parts.length === 0) return r.displayName;
  return parts.join(', ');
}

export async function forwardGeocode(
  query: string,
  signal?: AbortSignal,
): Promise<ForwardGeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(trimmed)}&limit=5`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
    signal,
  });
  if (!res.ok) return [];
  const json = (await res.json()) as NominatimForwardItem[];
  return json.map((i) => ({
    displayName: i.display_name,
    lng: Number(i.lon),
    lat: Number(i.lat),
  }));
}
