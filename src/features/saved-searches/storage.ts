import type { MarketplaceProvider, SearchFilters } from '@/marketplaces/types';
export interface SavedSearch { id:string; name?:string; query:string; filters:SearchFilters; createdAt:string; lastOpenedAt?:string }
export interface SavedSearchState { lastCheckedAt?:string; recentlySeenListingIds:string[]; newCount?:number }
export type StoredSavedSearch=SavedSearch&{state:SavedSearchState};
const KEY='ejsearch:saved:v1';
export function getSavedSearches():StoredSavedSearch[]{if(typeof window==='undefined')return[];try{const value=JSON.parse(localStorage.getItem(KEY)??'[]') as unknown;return Array.isArray(value)?value.filter(isSaved):[];}catch{return[]}}
function isSaved(x:unknown):x is StoredSavedSearch{return !!x&&typeof x==='object'&&typeof (x as SavedSearch).id==='string'&&typeof (x as SavedSearch).query==='string'}
export function writeSavedSearches(items:StoredSavedSearch[]){localStorage.setItem(KEY,JSON.stringify(items.slice(0,50)))}
export function saveSearch(query:string,filters:SearchFilters):StoredSavedSearch{const all=getSavedSearches();const key=JSON.stringify({query:query.trim().toLowerCase(),filters});const existing=all.find(x=>JSON.stringify({query:x.query.trim().toLowerCase(),filters:x.filters})===key);if(existing)return existing;const item:StoredSavedSearch={id:crypto.randomUUID(),query:query.trim(),filters,createdAt:new Date().toISOString(),state:{recentlySeenListingIds:[]}};writeSavedSearches([item,...all]);return item}
export function removeSavedSearch(id:string){writeSavedSearches(getSavedSearches().filter(x=>x.id!==id))}
export function updateSeen(id:string,ids:string[]){const all=getSavedSearches();const item=all.find(x=>x.id===id);if(!item)return 0;const previous=new Set(item.state.recentlySeenListingIds);const newCount=item.state.lastCheckedAt?ids.filter(x=>!previous.has(x)).length:0;item.state={lastCheckedAt:new Date().toISOString(),recentlySeenListingIds:ids.slice(0,300),newCount};item.lastOpenedAt=new Date().toISOString();writeSavedSearches(all);return newCount}
export function importSaved(raw:string){const parsed=JSON.parse(raw) as unknown;if(!Array.isArray(parsed)||!parsed.every(isSaved))throw new Error('Invalid saved-search file');writeSavedSearches(parsed.slice(0,50));}
export function exportSaved(){const blob=new Blob([JSON.stringify(getSavedSearches(),null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='ejsearch-saved-searches.json';link.click();URL.revokeObjectURL(link.href)}
export const allProviders:MarketplaceProvider[]=['kleinanzeigen','vinted'];
