# Device notifications and the smallest future architecture

## What works without a backend

1. **While open:** the app can compare current results to the bounded set of IDs in `localStorage` and show in-app “new” markers.
2. **User-initiated refresh:** it can do the same after opening a saved search or tapping a future “Check all” action. The browser Notification API could display a local notification after that action, subject to permission and browser support.
3. **Closed-app Web Push:** this requires a service worker, notification permission, a Push API subscription, VAPID keys, and a server capable of sending push messages. On iOS/iPadOS, Web Push is available to Home Screen web apps (iOS/iPadOS 16.4+), not an arbitrary background Safari tab; permission must follow direct user interaction. See [WebKit's announcement](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
4. **Reliable periodic search:** browsers do not reliably wake a closed PWA on a schedule. Periodic Background Sync has limited support and scheduling is browser-controlled. A server-side scheduler is required for dependable checks.

## Minimum accountless future design

A device creates a random UUID and sends a Web Push subscription plus its saved searches to a tiny server repository. Required server state is:

- anonymous device ID;
- push endpoint and encrypted subscription keys;
- query and filters for each saved search;
- a bounded set (for example 300) of recently seen normalized listing IDs;
- last-check time and optional failure/backoff metadata.

A scheduled function groups identical normalized searches, queries each provider once, compares IDs per device, updates bounded history, and sends a VAPID Web Push payload. There is no account or personal profile. A delete-device endpoint and expiring inactive subscriptions are important.

The smallest plausible stack is Vercel Cron + a free serverless KV/Redis store (for example Upstash) + the standard `web-push` package. Vercel Hobby cron timing is intentionally coarse and quotas change, so consult [Vercel's current cron pricing and limits](https://vercel.com/docs/cron-jobs/usage-and-pricing) before enabling it. A third-party push provider reduces push delivery code but does **not** remove the need to store searches/history or schedule marketplace checks.

None of this is included in the MVP: it adds durable state, scheduled compute, provider load, subscription lifecycle work, and potentially non-zero cost. Local manual checks remain honest and maintenance-free.
