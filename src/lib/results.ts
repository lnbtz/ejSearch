import type { Listing, SortOption } from '@/marketplaces/types';
const words = (s: string) => s.toLocaleLowerCase('de').replace(/[^a-z0-9äöüß]+/g, ' ').trim();
export function deduplicate(listings: Listing[]): Listing[] {
 const seen = new Set<string>();
 return listings.filter((item) => { const price = item.price ? `${item.price.amount}:${item.price.currency}` : 'none'; const city = words(item.location?.city ?? ''); const key = `${words(item.title)}|${price}|${city}`; if (seen.has(key)) return false; seen.add(key); return true; });
}
export function sortListings(items: Listing[], sort: SortOption, query=''): Listing[] {
 const score=(x:Listing)=>words(x.title).includes(words(query))?1:0;
 return [...items].sort((a,b)=> sort==='price-asc' ? (a.price?.amount??Infinity)-(b.price?.amount??Infinity) : sort==='price-desc' ? (b.price?.amount??-Infinity)-(a.price?.amount??-Infinity) : sort==='relevance' ? score(b)-score(a) : Date.parse(b.createdAt??b.fetchedAt)-Date.parse(a.createdAt??a.fetchedAt));
}
export function mergeResults(groups: Listing[][], sort: SortOption, query='') { return sortListings(deduplicate(groups.flat()),sort,query); }
