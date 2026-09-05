import { marketplaceFetch } from '@/lib/fetch';
import { UpstreamError } from '../errors';
import type { MarketplaceAdapter } from '../types';
import { mapKleinanzeigenHtml } from './mapper';

function searchSlug(query: string): string {
  return query
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de')
    .replace(/[^a-z0-9äöüß]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export const kleinanzeigenAdapter: MarketplaceAdapter = {
  id: 'kleinanzeigen',
  displayName: 'Kleinanzeigen',
  async search(input) {
    // This canonical search URL is what the public website itself exposes and avoids
    // the search-form submission endpoint that redirects or rejects server requests.
    const url = new URL(
      `/s-${searchSlug(input.query)}/k0`,
      'https://www.kleinanzeigen.de',
    );
    if (input.filters.minPrice !== undefined) {
      url.searchParams.set('minPrice', String(input.filters.minPrice));
    }
    if (input.filters.maxPrice !== undefined) {
      url.searchParams.set('maxPrice', String(input.filters.maxPrice));
    }

    const response = await marketplaceFetch(url.toString(), {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!response.ok) {
      throw new UpstreamError(
        this.id,
        'search',
        response.status,
        `Kleinanzeigen search returned HTTP ${response.status}`,
      );
    }

    let listings = mapKleinanzeigenHtml(await response.text()).slice(0, input.limit);
    if (input.filters.shippingOnly) {
      listings = listings.filter((listing) => listing.shippingAvailable === true);
    }
    return { provider: this.id, listings, fetchedAt: new Date().toISOString() };
  },
};

export { searchSlug };
