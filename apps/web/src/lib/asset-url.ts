import { API_BASE_URL } from './config';

const apiHost = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveAssetUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${apiHost}${url}`;
  return `${apiHost}/${url}`;
}
