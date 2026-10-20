import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // 2 minutes maximum execution duration

function getBackendUrl(): string {
  return process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetUrl = `${getBackendUrl()}/api/v1/${path.join('/')}${req.nextUrl.search}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        accept: req.headers.get('accept') || 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(120000), // 2-minute timeout
    });

    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Proxy connection failed';
    return NextResponse.json({ error: msg, target: targetUrl }, { status: 502 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetUrl = `${getBackendUrl()}/api/v1/${path.join('/')}${req.nextUrl.search}`;

  try {
    const contentType = req.headers.get('content-type') || '';
    const body = await req.arrayBuffer();

    const headers: Record<string, string> = {};
    if (contentType) {
      headers['content-type'] = contentType;
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(120000), // 2-minute timeout for LLM inference
    });

    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Proxy connection failed';
    return NextResponse.json({ error: msg, target: targetUrl }, { status: 502 });
  }
}
