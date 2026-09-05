import { marketplaceFetch } from '@/lib/fetch';
import { UpstreamError } from '../errors';
import type { MarketplaceAdapter } from '../types';
import { mapVintedItems } from './mapper';

const ORIGIN = 'https://www.vinted.de';
const SESSION_TTL_MS = 10 * 60 * 1000;
let session: { cookie: string; expiresAt: number } | undefined;

function cookieHeader(headers: Headers): string {
  const values = headers.getSetCookie?.() ?? [];
  const cookies = new Map<string, string>();

  // Vinted can send an empty access_token_web first and a populated value later.
  for (const raw of values) {
    const pair = raw.split(';', 1)[0];
    const separator = pair.indexOf('=');
    if (separator <= 0 || !pair.slice(separator + 1)) continue;
    cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }

  return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function createAnonymousSession(): Promise<string> {
  if (session && session.expiresAt > Date.now()) return session.cookie;
  const response = await marketplaceFetch(`${ORIGIN}/catalog`, {
    cacheMode: 'no-store',
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  const cookie = cookieHeader(response.headers);
  if (!response.ok || !cookie.includes('access_token_web=')) {
    throw new UpstreamError(
      'vinted',
      'session',
      response.status,
      `Vinted anonymous session bootstrap returned HTTP ${response.status}`,
    );
  }
  session = { cookie, expiresAt: Date.now() + SESSION_TTL_MS };
  return cookie;
}

export function clearVintedSession(): void {
  session = undefined;
}

async function fetchCatalog(url: URL, cookie: string): Promise<Response> {
  return marketplaceFetch(url.toString(), {
    cacheMode: 'no-store',
    headers: {
      Accept: 'application/json, text/plain, */*',
      Cookie: cookie,
      Referer: `${ORIGIN}/catalog`,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
}

export const vintedAdapter: MarketplaceAdapter = {
  id: 'vinted',
  displayName: 'Vinted',
  async search(input) {
    const cookie = await createAnonymousSession();
    const url = new URL('/api/v2/catalog/items', ORIGIN);
    url.searchParams.set('search_text', input.query);
    url.searchParams.set('per_page', String(input.limit));
    url.searchParams.set('page', '1');
    url.searchParams.set('order', 'newest_first');
    if (input.filters.minPrice !== undefined) {
      url.searchParams.set('price_from', String(input.filters.minPrice));
    }
    if (input.filters.maxPrice !== undefined) {
      url.searchParams.set('price_to', String(input.filters.maxPrice));
    }

    let response = await fetchCatalog(url, cookie);
    if (response.status === 401) {
      clearVintedSession();
      response = await fetchCatalog(url, await createAnonymousSession());
    }
    if (!response.ok) {
      throw new UpstreamError(
        this.id,
        'search',
        response.status,
        `Vinted catalog returned HTTP ${response.status}`,
      );
    }

    const payload = (await response.json()) as { items?: unknown[] };
    return {
      provider: this.id,
      listings: mapVintedItems(
        (payload.items ?? []) as Parameters<typeof mapVintedItems>[0],
      ),
      fetchedAt: new Date().toISOString(),
    };
  },
};

export { cookieHeader };
