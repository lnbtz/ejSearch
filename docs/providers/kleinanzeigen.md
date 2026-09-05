# Kleinanzeigen provider

**Recommendation: integrate cautiously (MVP).** Kleinanzeigen has highly relevant German table-tennis inventory, images, prices, locations, dates, and direct listing URLs.

- **Mechanism:** server-side parsing of the canonical public search result path `GET https://www.kleinanzeigen.de/s-<normalized-query>/k0`. This is HTML parsing, not an API. The old form target `/s-suchanfrage.html` is deliberately not used.
- **Current implementation check:** the actively published `n8n-nodes-kleinanzeigen-listings-scraper` package (v0.1.0, reviewed 2026-09-05) documents browser search URLs in the same `/s-iphone/k0` shape.
- **Status:** unofficial. No documented public listing-search API was identified.
- **Authentication:** none. The adapter uses a fixed mainstream compatibility user agent; it does not randomize fingerprints or send user credentials.
- **Verification:** the URL construction, request, and parser are fixture-tested. A live request from this development environment was attempted on 2026-09-05, but its outbound CONNECT proxy returned HTTP 403 before reaching Kleinanzeigen. Verify from the target Vercel function logs.
- **Rate limits:** not published for this mechanism. Responses are cached for 60 seconds, requests time out after ten seconds, and each user search issues at most one request per provider.
- **Fields:** title, EUR price, image, location, listing ID and canonical listing URL; dates are only included when the page exposes an ISO-like value.
- **Images:** remote Kleinanzeigen HTTPS image hosts are allow-listed; the UI falls back cleanly when absent.
- **Limitations:** selectors can change, relative dates are deliberately not guessed, and shipping cannot currently be normalized reliably.
- **Vercel access:** the function prefers `fra1`. If the marketplace rejects that egress IP with 403, an optional server-only `MARKETPLACE_PROXY_URL` is supported; see [`docs/vercel-provider-access.md`](../vercel-provider-access.md).
- **Risk/policy:** high breakage and blocking risk. Public page access does not imply an endorsed API. Operators should review applicable terms and disable the provider if requested or unreliable. The project does not bypass challenges or anti-bot controls.
