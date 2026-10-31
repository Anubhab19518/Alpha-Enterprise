
export interface Banner {
  id: string;
  ecommerceId: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  publicId?: string | null;
  redirectUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailSection {
  title: string;
  content: string;
}

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  message?: string;
  data: T;
  errors?: { field: string; message: string }[];
}

export interface EcommerceStore {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings?: {
    currency?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  parentId?: string | null;
  displayOrder: number;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  url: string;
  publicId?: string;
  displayOrder?: number;
}

export interface OptionValue {
  id: string;
  value: string;
  unitId?: string | null;
  productOptionId?: string;
  displayOrder?: number;
}

export interface ProductOption {
  id: string;
  name: string;
  displayOrder: number;
  values: OptionValue[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number | null;
  offerPrice: number | null;
  taxRate?: number;
  taxClass?: string | null;
  quantity: number;
  status: string;
  optionValues: OptionValue[];
  images?: ProductImage[];
  details?: ProductDetailSection[];
}

export interface Product {
  id: string;
  ecommerceId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  offerPrice: number | null;
  taxRate?: number;
  taxClass?: string | null;
  quantity: number;
  computedQuantity: number;
  hasVariants: boolean;
  status: string;
  images: ProductImage[];
  category?: Category;
  options?: ProductOption[];
  variants?: ProductVariant[];
  details?: ProductDetailSection[];
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  category: 'weight' | 'volume' | 'length' | 'piece';
}

export interface EffectivePricing {
  originalPrice: number;
  offerPrice: number | null;
  effectivePrice: number;
  basePriceWithoutTax: number;
  taxRate: number;
  taxClass?: string | null;
  taxAmount: number;
  hasDiscount: boolean;
  discountPercentage: number;
  formattedOriginal: string;
  formattedEffective: string;
  formattedTaxAmount?: string;
  formattedBasePrice?: string;
}

export interface CartItem {
  id: string; // unique cart entry key (productId + variantId)
  product: Product;
  variant: ProductVariant | null;
  selectedOptions: Record<string, string>; // optionName -> optionValue
  quantity: number;
  pricing: EffectivePricing;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  status?: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
  email?: string;
  address?: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  couponId?: string;
  code?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  discountAmount: number;
  eligibleSubtotal: number;
  affectedItemIds?: string[];
  message: string;
}

export interface CouponItem {
  id?: string;
  code: string;
  name?: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  rules?: {
    minOrderValue?: number;
    maxDiscountAmount?: number;
  };
}

export interface CustomerOrder {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponId?: string | null;
  couponCode?: string | null;
  couponDiscount?: number;
  total: number;
  shippingAddress: Partial<SavedAddress>;
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
}
