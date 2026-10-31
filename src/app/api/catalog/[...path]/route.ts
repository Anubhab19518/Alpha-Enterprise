import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api/v1';
const BACKEND_STORE_ID = process.env.BACKEND_STORE_ID || '3a2bdaa8-668a-46ab-86aa-bccc3764ae87';
const BACKEND_ADMIN_EMAIL = process.env.BACKEND_ADMIN_EMAIL || 'urbanvogue_admin@bazar.com';
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_ADMIN_PASSWORD || 'Password123!';

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getServerAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: BACKEND_ADMIN_EMAIL,
        password: BACKEND_ADMIN_PASSWORD,
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    if (data?.data?.accessToken) {
      cachedToken = data.data.accessToken;
      // Expire cache after 15 minutes
      tokenExpiresAt = Date.now() + 15 * 60 * 1000;
      return cachedToken;
    }
  } catch (error) {
    console.error('Server auth login failed:', error);
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const subPath = resolvedParams.path ? resolvedParams.path.join('/') : '';
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_API_URL}/catalog/${subPath}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const token = await getServerAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Ecommerce-Id': BACKEND_STORE_ID,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`BFF Proxy Error [GET /api/catalog/${subPath}]:`, error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to communicate with catalog backend service' },
      { status: 500 }
    );
  }
}
