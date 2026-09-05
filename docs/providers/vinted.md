# Vinted provider

**Recommendation: integrate cautiously (MVP).** Vinted has relevant small equipment and clothing inventory. It returns images, price, condition, seller and direct item URLs when available.

- **Mechanism:** establish an anonymous session with uncached `GET https://www.vinted.de/catalog`, retain the last non-empty cookies (including `access_token_web`), then call `GET /api/v2/catalog/items` with `search_text`, paging, ordering and price parameters. Catalog requests include same-origin `Referer` and `X-Requested-With` headers. A warm function reuses the anonymous session for at most ten minutes and reboots once after HTTP 401.
- **Current implementation check:** `@googlarz/vinted-client` v1.1.4 (reviewed 2026-09-05) uses `/catalog` bootstrap, last-populated cookie selection, ten-minute session reuse, same-origin catalog headers, and explicitly warns that cloud IP/TLS traffic can be blocked. The application follows the request semantics without importing its broader CLI/proxy stack.
- **Status:** unofficial/private web interface; it is not a supported public developer API.
- **Authentication:** no account. Anonymous cookies issued by Vinted are relayed server-side only and are never returned to the browser or logged.
- **Verification:** session cookie handling, exact request sequence/headers, URL, and mapper behavior are fixture-tested. A live request was attempted on 2026-09-05, but this environment's outbound CONNECT proxy returned HTTP 403 before reaching Vinted.
- **Rate limits:** not published. Searches use one catalog page (up to 30 items), a ten-second timeout, and no blind retry; only an expired 401 session is refreshed once.
- **Fields:** title, amount/currency, photo, item URL, city, condition, seller and timestamp where returned.
- **Images:** Vinted HTTPS image hosts are allow-listed; missing images have a text fallback.
- **Vercel access:** Vinted may reject data-center IP/TLS traffic before it creates a session. An optional server-only `MARKETPLACE_PROXY_URL` is supported for a permitted proxy; see [`docs/vercel-provider-access.md`](../vercel-provider-access.md).
- **Risk/policy:** high. Operators should review terms and disable this adapter if it becomes unreliable. No CAPTCHA bypass, randomized browser fingerprint, private credentials, or retries intended to defeat blocking are implemented.
