'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Banner } from '@/types/api';

interface HeroBannerProps {
  initialBanners?: Banner[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ initialBanners }) => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (initialBanners !== undefined) {
      setBanners(initialBanners);
    }
  }, [initialBanners]);

  // Responsive items per view detection matching Bewakoof layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  // Auto-play interval without arrows (Bewakoof style automatic sliding)
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3500);
    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (total === 0) return null;

  // Extended array for continuous sliding
  const displayBanners = total > 1 ? [...banners, ...banners] : banners;

  // Gap between cards in pixels
  const gapPx = itemsPerView === 1 ? 0 : itemsPerView === 2 ? 14 : 18;

  // Calculate CSS card width and translate offset so the active banner starts exactly from the edge (x = 0)
  const cardWidthCss =
    itemsPerView === 1
      ? '100%'
      : `calc((100% - ${(itemsPerView - 1) * gapPx}px) / ${itemsPerView})`;

  const translateOffsetCss =
    itemsPerView === 1
      ? `translateX(-${currentIndex * 100}%)`
      : `translateX(calc(-1 * ${currentIndex} * ((100% - ${(itemsPerView - 1) * gapPx}px) / ${itemsPerView} + ${gapPx}px)))`;

  return (
    <section
      className="relative w-full overflow-hidden py-3 sm:py-5 bg-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional Banners"
    >
      {/* Sliding Track Container starting exactly from edge */}
      <div className="w-full overflow-hidden px-3 sm:px-5 lg:px-8">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: translateOffsetCss,
            gap: `${gapPx}px`,
          }}
        >
          {displayBanners.map((banner, index) => {
            return (
              <div
                key={`${banner.id}-${index}`}
                className="shrink-0 h-[430px] sm:h-[490px] md:h-[540px] lg:h-[570px] rounded-none overflow-hidden bg-neutral-900 relative shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                style={{
                  width: cardWidthCss,
                }}
              >
                <Link
                  href={banner.redirectUrl || '/shop'}
                  className="block w-full h-full relative"
                >
                  {/* Full Card Banner Image */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                  />

                  {/* Gradient Overlay & Text Layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5 sm:p-7 md:p-8 space-y-2">
                    {banner.subtitle && (
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-amber-400 text-neutral-950 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xs shadow-xs">
                          {banner.subtitle}
                        </span>
                      </div>
                    )}

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight drop-shadow-md">
                      {banner.title}
                    </h2>

                    <div className="pt-1 flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-200 group-hover:text-amber-300 transition-colors">
                      <span>Explore Collection →</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bewakoof Style Minimalist Bottom Pagination Indicator Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 pt-3.5 sm:pt-4">
          {banners.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-6 sm:w-8 bg-neutral-900'
                    : 'w-1.5 sm:w-2 bg-neutral-300 hover:bg-neutral-400'
                }`}
                aria-label={`Go to banner slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
