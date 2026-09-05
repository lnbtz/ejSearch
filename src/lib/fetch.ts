import { fetch as undiciFetch, ProxyAgent } from 'undici';
import { UpstreamError } from '@/marketplaces/errors';

const ALLOWED_UPSTREAM_HOSTS = new Set([
  'www.kleinanzeigen.de',
  'www.vinted.de',
]);

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

let proxyAgent: ProxyAgent | undefined;

export interface MarketplaceFetchOptions extends RequestInit {
  /** Session bootstrap responses contain cookies and must never enter Next's data cache. */
  cacheMode?: 'short' | 'no-store';
}

export async function marketplaceFetch(
  url: string,
  { cacheMode = 'short', ...init }: MarketplaceFetchOptions = {},
): Promise<Response> {
  const parsed = new URL(url);
  if (!ALLOWED_UPSTREAM_HOSTS.has(parsed.hostname)) {
    throw new Error('Disallowed upstream host');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const headers = {
    'User-Agent': process.env.MARKETPLACE_USER_AGENT ?? DEFAULT_USER_AGENT,
    'Accept-Language': 'de-DE,de;q=0.9,en;q=0.7',
    ...init.headers,
  };

  try {
    const proxyUrl = process.env.MARKETPLACE_PROXY_URL;
    if (proxyUrl) {
      const proxy = new URL(proxyUrl);
      if (!['http:', 'https:'].includes(proxy.protocol)) {
        throw new Error('MARKETPLACE_PROXY_URL must use HTTP or HTTPS');
      }
      proxyAgent ??= new ProxyAgent(proxyUrl);
      return (await undiciFetch(
        parsed,
        {
          ...init,
          headers,
          signal: controller.signal,
          dispatcher: proxyAgent,
        } as unknown as Parameters<typeof undiciFetch>[1],
      )) as unknown as Response;
    }

    return await fetch(parsed, {
      ...init,
      headers,
      signal: controller.signal,
      ...(cacheMode === 'no-store'
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 60 } }),
    });
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    throw new UpstreamError(
      parsed.hostname.includes('vinted') ? 'vinted' : 'kleinanzeigen',
      'network',
      undefined,
      error instanceof Error ? error.message : 'Upstream network request failed',
    );
  } finally {
    clearTimeout(timeout);
  }
}
