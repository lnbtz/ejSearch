# Provider access from Vercel

## Why both providers previously failed

The original implementation had two request bugs independent of hosting:

1. Kleinanzeigen was called through `/s-suchanfrage.html`, the search form submission target. Server requests can be redirected or rejected there. The adapter now requests the canonical public result path `/s-<slug>/k0`.
2. Vinted was bootstrapped at `/`, while current clients bootstrap `/catalog`. The response was also eligible for Next's Data Cache even though it contains session cookies, duplicate empty/populated `access_token_web` cookies were not handled, and the catalog request lacked same-origin `Referer` and `X-Requested-With` headers. These are now corrected and request-tested.

The route is pinned to Vercel's Frankfurt region (`fra1`), which is geographically appropriate for the German sites.

## If a provider still returns `upstream_blocked`

A remaining HTTP 403 is an upstream network policy decision, not a parsing error. Both marketplaces may reject hosting-provider IP ranges. Changing HTML selectors or retrying will not fix an HTTP 403, and this project will not bypass a CAPTCHA, rotate identities, or spoof browser fingerprints.

The API now returns a safe reason code (`upstream_blocked`, `upstream_rate_limited`, or `upstream_error`) and logs the provider, stage, upstream status, and duration in Vercel logs. It never logs cookies or proxy credentials.

For a personal deployment, the supported fallback is an optional HTTP(S) forward proxy:

1. Use a proxy you control or a provider whose policy permits requests to these marketplaces.
2. Add `MARKETPLACE_PROXY_URL` as a **server-only** Vercel environment variable. Do not prefix it with `NEXT_PUBLIC_`.
3. Redeploy and search again. The same fixed-host allow-list, rate limit, timeout, and 60-second Kleinanzeigen cache still apply.

Example syntax:

```text
MARKETPLACE_PROXY_URL=https://username:password@proxy.example:8443
```

This is intentionally optional. There is no honest code-only guarantee that an unofficial marketplace interface will accept every Vercel egress IP. If adding an external proxy conflicts with the €0/month constraint, disable the blocked provider or run the app locally; the longer-term reliable option is a marketplace with an official API, such as eBay Browse API.

## Vercel checklist

- Keep `ENABLED_PROVIDERS=kleinanzeigen,vinted` or omit it (that is the default).
- Do not set `MARKETPLACE_USER_AGENT` to the old `ejSearch/1.0` value; remove the variable to use the stable compatibility default.
- Inspect one failed function invocation. `stage: "session"` means Vinted rejected session creation; `stage: "search"` means the listing request itself failed.
- A successful HTTP response with zero parsed listings is a markup/parser issue, not an egress block. Preserve a redacted response fixture and update the mapper rather than adding retries.
