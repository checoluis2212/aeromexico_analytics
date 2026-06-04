import type { Metadata } from 'next';
import { Roboto, Roboto_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/components/analytics/google-tag-manager';
import { resolveGtmId } from '@/lib/analytics/gtm-id';
import { siteConfig } from '@/lib/constants';
import { APP_THEME } from '@/lib/theme';
import './globals.css';

const roboto = Roboto({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
    locale: 'es_ES',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = resolveGtmId();

  return (
    <html lang="es" className="dark" data-theme={APP_THEME} suppressHydrationWarning>
      <GoogleTagManager gtmId={gtmId} />
      <body className={`${roboto.variable} ${robotoMono.variable} theme-root font-sans min-h-screen flex flex-col`}>
        <GoogleTagManagerNoScript gtmId={gtmId} />
        <div aria-hidden className="theme-background" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
