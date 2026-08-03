import './globals.css';
import { Playfair_Display, Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/components/CartContext';
import { WishlistProvider } from '@/components/WhishlistContext';
import BottomNav from '@/components/BottomNav';
import { dbConnect } from '@/lib/mongodb';
import Settings from '@/models/Settings';

const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', weight: ['600', '700', '800'] });
const body = Poppins({ subsets: ['latin'], variable: '--font-body', weight: ['300', '400', '500', '600', '700'] });

export async function generateMetadata() {
  let settings = null;
  try {
    await dbConnect();
    settings = await Settings.findOne({ key: 'global' });
  } catch {
    settings = null;
  }
  const title = settings?.seoTitle || 'Mohith Trends - Style That Speaks You';
  const description =
    settings?.seoDescription ||
    'Shop authentic women\'s kurtis, nighties, innerwear and trending collections online from Mohith Trends.';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mohithtrends.com';
  return {
    title: { default: title, template: '%s | Mohith Trends' },
    description,
    metadataBase: new URL(siteUrl),
    keywords: ['women kurtis online', 'nighties online', 'innerwear online', 'Mohith Trends', 'women fashion'],
    openGraph: { title, description, siteName: 'Mohith Trends', type: 'website' },
    icons: { icon: '/favicon.ico' },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} font-body antialiased bg-white text-black`}
      >
        <CartProvider>
          <WishlistProvider>
            {children}

            {/* spacer so page content isn't hidden behind the fixed mobile nav */}
            <div className="md:hidden h-16" />

            <BottomNav />
          </WishlistProvider>
        </CartProvider>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              background: '#fff',
              color: '#0A0A0A',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '2px',
              fontSize: '13px',
              fontWeight: '400',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#C6A15B',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#0A0A0A',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}