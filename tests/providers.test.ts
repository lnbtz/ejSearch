import { afterEach, describe, expect, it, vi } from 'vitest';
import { kleinanzeigenAdapter, searchSlug } from '@/marketplaces/kleinanzeigen/adapter';
import { clearVintedSession, cookieHeader, vintedAdapter } from '@/marketplaces/vinted/adapter';

const html = `
  <article class="aditem" data-adid="123">
    <a class="ellipsis" href="/s-anzeige/fastarc/123-230-1">Fastarc G-1</a>
    <div class="aditem-main--middle--price-shipping--price">22 €</div>
  </article>`;

afterEach(() => {
  clearVintedSession();
  vi.unstubAllGlobals();
  delete process.env.MARKETPLACE_PROXY_URL;
});

describe.sequential('provider requests', () => {
  it('uses the canonical Kleinanzeigen public search URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(html));
    vi.stubGlobal('fetch', fetchMock);

    const result = await kleinanzeigenAdapter.search({
      query: 'Fastarc G-1',
      filters: { minPrice: 10, maxPrice: 30 },
      limit: 20,
    });

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.pathname).toBe('/s-fastarc-g-1/k0');
    expect(url.searchParams.get('minPrice')).toBe('10');
    expect(result.listings).toHaveLength(1);
  });

  it('creates a non-cached Vinted session and sends it with same-origin headers', async () => {
    const sessionHeaders = new Headers();
    sessionHeaders.append('set-cookie', 'access_token_web=; Path=/');
    sessionHeaders.append('set-cookie', 'access_token_web=working-token; Path=/; HttpOnly');
    sessionHeaders.append('set-cookie', 'anon_id=device; Path=/');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { headers: sessionHeaders }))
      .mockResolvedValueOnce(
        Response.json({
          items: [
            {
              id: 9,
              title: 'Fastarc G-1',
              url: '/items/9-fastarc-g-1',
              price: { amount: '19', currency_code: 'EUR' },
            },
          ],
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await vintedAdapter.search({
      query: 'Fastarc G-1',
      filters: {},
      limit: 30,
    });

    expect(String(fetchMock.mock.calls[0][0])).toBe('https://www.vinted.de/catalog');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-store' });
    const apiOptions = fetchMock.mock.calls[1][1] as RequestInit;
    expect(new Headers(apiOptions.headers).get('cookie')).toContain(
      'access_token_web=working-token',
    );
    expect(new Headers(apiOptions.headers).get('referer')).toBe(
      'https://www.vinted.de/catalog',
    );
    expect(result.listings[0].listingUrl).toContain('/items/9-fastarc-g-1');
  });
});

describe('provider helpers', () => {
  it('normalizes a Kleinanzeigen search slug without losing German letters', () => {
    expect(searchSlug('  Timo Boll ALC  ')).toBe('timo-boll-alc');
  });

  it('keeps the last populated duplicate cookie', () => {
    const headers = new Headers();
    headers.append('set-cookie', 'access_token_web=; Path=/');
    headers.append('set-cookie', 'access_token_web=token; Path=/');
    expect(cookieHeader(headers)).toContain('access_token_web=token');
  });
});
