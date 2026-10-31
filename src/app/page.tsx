import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductGrid } from '@/components/ProductGrid';
import { catalogService } from '@/services/catalogService';

export const revalidate = 0;

export default async function HomePage() {
  const [products, categories, banners] = await Promise.all([
    catalogService.getProducts(),
    catalogService.getCategories(),
    catalogService.getBanners(),
  ]);

  return (
    <div className="space-y-16 pb-16">
      {/* Editorial Hero Banner */}
      <HeroBanner initialBanners={banners} />

      {/* Brand Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-y border-neutral-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-1.5 p-2">
            <Truck className="w-5 h-5 text-neutral-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Complimentary Shipping</h4>
            <p className="text-[11px] text-neutral-500">On all global orders over ₹2,000</p>
          </div>
          <div className="flex flex-col items-center space-y-1.5 p-2">
            <ShieldCheck className="w-5 h-5 text-neutral-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Authentic Guarantee</h4>
            <p className="text-[11px] text-neutral-500">100% verified luxury craftsmanship</p>
          </div>
          <div className="flex flex-col items-center space-y-1.5 p-2">
            <RefreshCw className="w-5 h-5 text-neutral-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Hassle-Free Returns</h4>
            <p className="text-[11px] text-neutral-500">30-day seamless customer policy</p>
          </div>
          <div className="flex flex-col items-center space-y-1.5 p-2">
            <Sparkles className="w-5 h-5 text-neutral-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Exclusive Tailoring</h4>
            <p className="text-[11px] text-neutral-500">Curated multi-tenant collections</p>
          </div>
        </div>
      </section>

      {/* Catalog Products Section - 100% Live Backend Data */}
      <section className="w-full px-3 sm:px-5 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-neutral-200/80 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              Store Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 uppercase tracking-tight">
              Featured Products ({products.length})
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-neutral-500 transition-colors flex items-center gap-1 group"
          >
            <span>View All In Shop</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ProductGrid
          products={products}
          emptyTitle="No Catalog Products Available"
          emptySubtitle="There are currently no published products configured in the backend database for this store."
        />
      </section>

      {/* Editorial Split Collection Banners (NEMA CO Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="relative bg-neutral-900 text-white rounded-sm p-8 sm:p-12 min-h-[320px] flex flex-col justify-end overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            <div className="relative z-20 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                Editorial Capsule
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
                Everyday essentials built for comfort & durability
              </h3>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-neutral-300 transition-colors"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative bg-neutral-800 text-white rounded-sm p-8 sm:p-12 min-h-[320px] flex flex-col justify-end overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            <div className="relative z-20 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                Seasonal Tailoring
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
                Wear It Your Way
              </h3>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-neutral-300 transition-colors"
                >
                  <span>Browse Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Navigation
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 uppercase tracking-tight">
              Explore By Category
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group relative bg-neutral-100 hover:bg-neutral-950 p-6 sm:p-8 rounded-sm text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] border border-neutral-200/60 hover:border-black shadow-xs"
              >
                <span className="font-serif text-base sm:text-lg font-bold text-neutral-900 group-hover:text-white uppercase tracking-wider transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 group-hover:text-neutral-400 mt-2 transition-colors">
                  Browse Collection →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
