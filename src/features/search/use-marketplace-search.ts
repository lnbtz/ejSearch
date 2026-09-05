'use client';

import { useCallback, useRef, useState } from 'react';
import type {
  Listing,
  MarketplaceProvider,
  ProviderResponse,
  SearchFilters,
} from '@/marketplaces/types';

const providers: MarketplaceProvider[] = ['kleinanzeigen', 'vinted'];
export type ProviderFailureReason =
  | 'upstream_blocked'
  | 'upstream_rate_limited'
  | 'upstream_error';

export function useMarketplaceSearch() {
  const [groups, setGroups] = useState<
    Partial<Record<MarketplaceProvider, Listing[]>>
  >({});
  const [statuses, setStatuses] = useState<
    Partial<Record<MarketplaceProvider, ProviderResponse['status'] | 'loading'>>
  >({});
  const [failures, setFailures] = useState<
    Partial<Record<MarketplaceProvider, ProviderFailureReason>>
  >({});
  const controller = useRef<AbortController>(null);

  const search = useCallback(async (query: string, filters: SearchFilters = {}) => {
    controller.current?.abort();
    controller.current = new AbortController();
    const active = filters.providers?.length ? filters.providers : providers;
    setGroups({});
    setFailures({});
    setStatuses(Object.fromEntries(active.map((provider) => [provider, 'loading'])));

    const jobs = active.map(async (provider) => {
      const params = new URLSearchParams({ q: query, limit: '30' });
      if (filters.minPrice !== undefined) {
        params.set('minPrice', String(filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        params.set('maxPrice', String(filters.maxPrice));
      }
      if (filters.shippingOnly) params.set('shippingOnly', 'true');

      try {
        const response = await fetch(`/api/search/${provider}?${params}`, {
          signal: controller.current?.signal,
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            reason?: ProviderFailureReason;
          };
          if (body.reason) {
            setFailures((old) => ({ ...old, [provider]: body.reason }));
          }
          throw new Error(`Provider ${provider} failed`);
        }
        const data = (await response.json()) as { listings: Listing[] };
        setGroups((old) => ({ ...old, [provider]: data.listings }));
        setStatuses((old) => ({ ...old, [provider]: 'success' }));
        return data.listings;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setStatuses((old) => ({ ...old, [provider]: 'error' }));
        }
        return [];
      }
    });

    return (await Promise.all(jobs)).flat();
  }, []);

  return { groups, statuses, failures, search };
}
