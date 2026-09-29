import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TabBar } from '@/components/Navigation/TabBar';

export const metadata: Metadata = {
  title: 'IRON LEDGER — Gym Weight Tracker',
  description: 'Reference and progressive overload tool for lifters',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IRON LEDGER',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0B0B0A] text-[#E8E6E1] font-body min-h-screen antialiased flex flex-col items-center selection:bg-[#C8471B] selection:text-[#E8E6E1]">
        {/* Faint static noise texture background overlay */}
        <div className="noise-overlay" aria-hidden="true" />

        <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-[#0B0B0A] border-x border-[#2A2A27]/50 relative pb-24">
          <main className="flex-1 w-full">{children}</main>
          <TabBar />
        </div>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
