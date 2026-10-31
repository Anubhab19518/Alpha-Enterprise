import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api/v1';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const subPath = resolvedParams.path ? resolvedParams.path.join('/') : '';
  const body = await request.json();

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/${subPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`BFF Proxy Error [POST /api/auth/${subPath}]:`, error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to communicate with authentication service' },
      { status: 500 }
    );
  }
}
