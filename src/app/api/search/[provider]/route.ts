import { NextResponse } from 'next/server';
import { getAdapter } from '@/marketplaces';
import { UpstreamError } from '@/marketplaces/errors';
import { providerIds, type MarketplaceProvider } from '@/marketplaces/types';
import { searchSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const started = Date.now();
  const { provider } = await params;
  if (!providerIds.includes(provider as MarketplaceProvider)) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 404 });
  }

  const parsed = searchSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid search', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const adapter = getAdapter(provider as MarketplaceProvider);
  if (!adapter) {
    return NextResponse.json({ error: 'Provider disabled' }, { status: 503 });
  }

  try {
    const result = await adapter.search({
      query: parsed.data.q,
      filters: {
        minPrice: parsed.data.minPrice,
        maxPrice: parsed.data.maxPrice,
        shippingOnly: parsed.data.shippingOnly,
      },
      limit: parsed.data.limit,
    });
    const durationMs = Date.now() - started;
    console.info(
      JSON.stringify({
        provider,
        durationMs,
        status: 'success',
        results: result.listings.length,
      }),
    );
    return NextResponse.json({ ...result, durationMs });
  } catch (error) {
    const durationMs = Date.now() - started;
    const upstream = error instanceof UpstreamError ? error : undefined;
    console.error(
      JSON.stringify({
        provider,
        durationMs,
        status: 'failure',
        stage: upstream?.stage ?? 'unknown',
        upstreamStatus: upstream?.status,
        errorClass: error instanceof Error ? error.name : 'UnknownError',
      }),
    );
    return NextResponse.json(
      {
        provider,
        error: 'Marketplace is temporarily unavailable',
        reason:
          upstream?.status === 403
            ? 'upstream_blocked'
            : upstream?.status === 429
              ? 'upstream_rate_limited'
              : 'upstream_error',
        stage: upstream?.stage,
        durationMs,
      },
      { status: 502 },
    );
  }
}
