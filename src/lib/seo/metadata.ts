import { site } from '../../data/site';

export function getCanonicalUrl(path = '/'): string {
  return new URL(path, site.url).toString();
}
