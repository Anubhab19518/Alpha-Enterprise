import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { STORE_CONFIG } from '@/config/store';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { CartDrawer } from '@/components/CartDrawer';
import { AuthModal } from '@/components/AuthModal';
import { Footer } from '@/components/Footer';
import { catalogService } from '@/services/catalogService';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: `${STORE_CONFIG.name} | Luxury Fashion & Modern Apparel`,
  description: `Discover the luxury fashion collection at ${STORE_CONFIG.name}. Shop high-quality apparel, outerwear, and accessories.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch categories on server for layout navigation
  const categories = await catalogService.getCategories();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-neutral-900 min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Header categories={categories} />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <AuthModal />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
