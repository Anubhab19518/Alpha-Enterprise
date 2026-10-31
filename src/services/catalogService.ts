import { Product, Category, Banner, CartItem, CustomerOrder, CouponItem, CouponValidationResponse } from '@/types/api';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api/v1';
const BACKEND_STORE_ID = process.env.BACKEND_STORE_ID || '3a2bdaa8-668a-46ab-86aa-bccc3764ae87';
const BACKEND_ADMIN_EMAIL = process.env.BACKEND_ADMIN_EMAIL || 'urbanvogue_admin@bazar.com';
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_ADMIN_PASSWORD || 'Password123!';

let serverTokenCache: { token: string; expiresAt: number } | null = null;

async function getServerAccessToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && serverTokenCache && serverTokenCache.expiresAt > now + 60000) {
    return serverTokenCache.token;
  }

  try {
    const res = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: BACKEND_ADMIN_EMAIL,
        password: BACKEND_ADMIN_PASSWORD,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Server authentication failed with status ${res.status}`);
    }

    const data = await res.json();
    const token = data?.data?.accessToken;

    if (!token) {
      throw new Error('Access token missing from auth response');
    }

    serverTokenCache = {
      token,
      expiresAt: now + 14 * 60 * 1000,
    };

    return token;
  } catch (err) {
    console.error('[CatalogService] Failed to authenticate SSR token:', err);
    throw err;
  }
}

async function fetchCatalog<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  try {
    const token = await getServerAccessToken(isRetry);

    const res = await fetch(`${BACKEND_API_URL}/catalog/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Ecommerce-Id': BACKEND_STORE_ID,
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      if (res.status === 401 && !isRetry) {
        serverTokenCache = null;
        return fetchCatalog<T>(endpoint, options, true);
      }
      if (res.status === 404) return null as T;
      const errorJson = await res.json().catch(() => null);
      const errMsg = errorJson?.message || `Catalog API error ${res.status}: ${res.statusText}`;
      throw new Error(errMsg);
    }

    const json = await res.json();
    return json.data as T;
  } catch (err) {
    console.error(`[CatalogService] Error fetching ${endpoint}:`, err);
    throw err;
  }
}

export const catalogService = {
  async getProducts(): Promise<Product[]> {
    try {
      const data = await fetchCatalog<Product[]>('products');
      return data || [];
    } catch {
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await fetchCatalog<Product>(`products/${id}`);
    } catch {
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const data = await fetchCatalog<Category[]>('categories');
      return data || [];
    } catch {
      return [];
    }
  },

  async getBanners(): Promise<Banner[]> {
    try {
      const data = await fetchCatalog<Banner[]>('banners?active=true');
      return data || [];
    } catch {
      return [];
    }
  },

  async createOrder(orderData: Partial<CustomerOrder>): Promise<unknown> {
    try {
      const backendPayload = {
        id: orderData.id,
        customerName: orderData.shippingAddress?.fullName || 'Customer',
        customerEmail: (orderData.shippingAddress as Record<string, unknown> | undefined)?.email || '',
        customerPhone: orderData.shippingAddress?.phone || '',
        itemsCount: Array.isArray(orderData.items)
          ? orderData.items.reduce((sum: number, i: CartItem) => sum + (i.quantity || 1), 0)
          : 1,
        total: orderData.total || 0,
        status: orderData.status || 'PROCESSING',
        shippingAddress: orderData.shippingAddress || {},
        couponId: (orderData as Record<string, unknown>).couponId || null,
        couponCode: orderData.couponCode || null,
        couponDiscount: orderData.couponDiscount || 0,
        items: Array.isArray(orderData.items)
          ? orderData.items.map((i: CartItem, idx: number) => ({
              id: i.id || `item-${idx}-${Date.now()}`,
              quantity: i.quantity || 1,
              product: {
                id: i.product?.id,
                name: i.product?.name || 'Product',
                images: i.product?.images || [],
              },
              selectedOptions: i.selectedOptions || {},
              variant: i.variant
                ? {
                    id: i.variant.id,
                    sku: i.variant.sku || '',
                    images: i.variant.images || [],
                    optionValues: i.variant.optionValues || [],
                  }
                : null,
              pricing: { effectivePrice: i.pricing?.effectivePrice || 0 },
            }))
          : [],
      };
      return await fetchCatalog<unknown>('orders', {
        method: 'POST',
        body: JSON.stringify(backendPayload),
      });
    } catch (e) {
      console.error('[CatalogService] Failed to post order to backend:', e);
      return orderData;
    }
  },

  async getOrders(): Promise<CustomerOrder[]> {
    try {
      const data = await fetchCatalog<CustomerOrder[]>('orders');
      return data || [];
    } catch {
      return [];
    }
  },

  async getCoupons(): Promise<CouponItem[]> {
    try {
      const data = await fetchCatalog<CouponItem[]>('coupons?isActive=true');
      return data || [];
    } catch {
      return [];
    }
  },

  async validateCoupon(
    code: string,
    cartItems: CartItem[],
    customerEmail?: string,
    subtotal?: number
  ): Promise<CouponValidationResponse> {
    try {
      const cleanEmail =
        typeof customerEmail === 'string' && customerEmail.trim().length > 0
          ? customerEmail.trim()
          : undefined;

      const payload = {
        code: (code || '').trim().toUpperCase(),
        customerEmail: cleanEmail,
        cartItems: Array.isArray(cartItems)
          ? cartItems.map((i) => ({
              id: i.id,
              product: {
                id: i.product?.id,
                name: i.product?.name,
                categoryId: i.product?.categoryId,
                price: Number(i.product?.price || 0),
                offerPrice:
                  i.product?.offerPrice !== undefined && i.product?.offerPrice !== null
                    ? Number(i.product.offerPrice)
                    : null,
              },
              variant: i.variant
                ? {
                    id: i.variant.id,
                    sku: i.variant.sku,
                  }
                : null,
              quantity: i.quantity || 1,
              pricing: {
                effectivePrice: Number(
                  i.pricing?.effectivePrice ||
                    i.product?.offerPrice ||
                    i.product?.price ||
                    0
                ),
              },
            }))
          : [],
        subtotal: Number(subtotal) || 0,
      };

      const res = await fetchCatalog<CouponValidationResponse>('coupons/validate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return (
        res || {
          valid: false,
          discountAmount: 0,
          eligibleSubtotal: 0,
          message: 'Unable to validate coupon',
        }
      );
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Invalid coupon code or server error';
      return {
        valid: false,
        discountAmount: 0,
        eligibleSubtotal: 0,
        message: errorMsg,
      };
    }
  },
};
