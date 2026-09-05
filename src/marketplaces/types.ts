export const providerIds = ['kleinanzeigen', 'vinted'] as const;
export type MarketplaceProvider = (typeof providerIds)[number];
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'relevance';
export interface SearchFilters { minPrice?: number; maxPrice?: number; providers?: MarketplaceProvider[]; country?: string; condition?: string; shippingOnly?: boolean }
export interface MarketplaceSearchQuery { query: string; filters: SearchFilters; limit: number }
export interface Listing { id: string; provider: MarketplaceProvider; providerListingId: string; title: string; description?: string; price?: { amount: number; currency: string }; imageUrl?: string; imageUrls?: string[]; listingUrl: string; location?: { city?: string; country?: string; postalCode?: string }; shippingAvailable?: boolean; shippingPrice?: number; condition?: string; sellerName?: string; createdAt?: string; fetchedAt: string }
export interface MarketplaceSearchResult { provider: MarketplaceProvider; listings: Listing[]; fetchedAt: string }
export interface MarketplaceAdapter { id: MarketplaceProvider; displayName: string; search(input: MarketplaceSearchQuery): Promise<MarketplaceSearchResult> }
export interface ProviderResponse { provider: MarketplaceProvider; status: 'success'|'error'; listings: Listing[]; durationMs: number; error?: string }
