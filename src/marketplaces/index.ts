import type { MarketplaceAdapter, MarketplaceProvider } from './types'; import { kleinanzeigenAdapter } from './kleinanzeigen/adapter'; import { vintedAdapter } from './vinted/adapter';
const all:Record<MarketplaceProvider,MarketplaceAdapter>={kleinanzeigen:kleinanzeigenAdapter,vinted:vintedAdapter};
export function getAdapter(id:MarketplaceProvider){const enabled=(process.env.ENABLED_PROVIDERS??'kleinanzeigen,vinted').split(',');return enabled.includes(id)?all[id]:undefined;}
