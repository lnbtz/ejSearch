# Vinted provider

**Recommendation: integrate cautiously (MVP).** Vinted has relevant small equipment and clothing inventory. It returns images, price, condition, seller and direct item URLs when available.

- **Mechanism:** establish an anonymous session on `https://www.vinted.de/`, then call the web catalog JSON endpoint `GET /api/v2/catalog/items` with `search_text`, paging and price parameters.
- **Status:** unofficial/private web interface; it is not a supported public developer API.
- **Authentication:** no account. Only anonymous cookies issued by the homepage bootstrap are relayed server-side for that request; they are never returned to the browser or logged.
- **Verification:** mapper behavior is fixture-tested. A live request was attempted on 2026-09-05, but this environment's outbound CONNECT proxy returned HTTP 403 before reaching Vinted. The provider therefore reports a clear unavailable state when deployment access is blocked.
- **Rate limits:** not published. Searches use 60-second caching, an eight-second timeout and one catalog page (up to 30 items).
- **Fields:** title, amount/currency, photo, item URL, city, condition, seller and timestamp where returned.
- **Images:** Vinted HTTPS image hosts are allow-listed; missing images have a text fallback.
- **Limitations:** response fields or session requirements may change without notice; geographic catalogue behavior depends on Vinted's anonymous session.
- **Risk/policy:** high. Operators should review terms and disable this adapter if it becomes unreliable. No CAPTCHA bypass, fingerprint spoofing, private credentials, or retries intended to defeat blocking are implemented.
