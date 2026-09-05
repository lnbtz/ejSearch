export async function marketplaceFetch(url: string, init: RequestInit = {}) {
 const allowed = ['www.kleinanzeigen.de','www.vinted.de']; const parsed = new URL(url); if (!allowed.includes(parsed.hostname)) throw new Error('Disallowed upstream host');
 const controller = new AbortController(); const timeout=setTimeout(()=>controller.abort(),8000);
 try { return await fetch(parsed,{...init,signal:controller.signal,headers:{Accept:'text/html,application/json;q=0.9', 'User-Agent':process.env.MARKETPLACE_USER_AGENT??'ejSearch/1.0',...init.headers},next:{revalidate:60}}); } finally { clearTimeout(timeout); }
}
