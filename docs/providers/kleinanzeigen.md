# Kleinanzeigen provider

**Recommendation: integrate cautiously (MVP).** Kleinanzeigen has highly relevant German table-tennis inventory, images, prices, locations, dates, and direct listing URLs.

- **Mechanism:** server-side parsing of the public `GET https://www.kleinanzeigen.de/s-suchanfrage.html?keywords=…` search page. This is HTML parsing, not an API.
- **Status:** unofficial. No documented public listing-search API was identified.
- **Authentication:** none. The adapter sends an honest, configurable application user agent and does not send user credentials.
- **Verification:** the implementation and parser are fixture-tested. A live request from this development environment was attempted on 2026-09-05, but its outbound CONNECT proxy returned HTTP 403 before reaching Kleinanzeigen. Verify from the target Vercel region before relying on it.
- **Rate limits:** not published for this mechanism. Responses are cached for 60 seconds, requests time out after eight seconds, and each user search issues at most one request per provider.
- **Fields:** title, EUR price, image, location, listing ID and canonical listing URL; dates are only included when the page exposes an ISO-like value.
- **Images:** remote Kleinanzeigen HTTPS image hosts are allow-listed for Next Image; the UI falls back cleanly when absent.
- **Limitations:** selectors can change, relative dates are deliberately not guessed, and shipping cannot currently be normalized reliably.
- **Risk/policy:** high breakage and blocking risk. Public page access does not imply an endorsed API. Operators should review applicable terms and disable the provider through `ENABLED_PROVIDERS` if requested or unreliable. The project does not bypass challenges or anti-bot controls.
