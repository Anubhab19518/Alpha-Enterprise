export interface StoreConfig {
  name: string;
  ecommerceId: string;
  slug: string;
  logoUrl: string;
  currency: string;
  currencySymbol: string;
}

export const STORE_CONFIG: StoreConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "Alpha Enterprise",
  ecommerceId: process.env.NEXT_PUBLIC_STORE_ID || "3a2bdaa8-668a-46ab-86aa-bccc3764ae87",
  slug: process.env.NEXT_PUBLIC_STORE_SLUG || "alpha-enterprise",
  logoUrl: "/alpha-logo.png",
  currency: "INR",
  currencySymbol: "₹",
};
