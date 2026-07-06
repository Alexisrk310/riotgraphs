import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@/components/analytics';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/query-provider';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

const APP_URL = env.NEXT_PUBLIC_APP_URL;

export const viewport: Viewport = {
  themeColor: '#05070b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'RiotGraphs — Advanced competitive stats for the Riot ecosystem',
    template: '%s · RiotGraphs',
  },
  description:
    'Deep competitive analytics for League of Legends, Valorant, TFT and LoR. Player profiles, tier lists, meta trends and AI insights — powered by the Riot Games API.',
  keywords: [
    'League of Legends stats',
    'LoL stats',
    'Valorant stats',
    'TFT stats',
    'Riot Games stats',
    'champion tier list',
    'meta analysis',
    'player rankings',
    'RiotGraphs',
  ],
  applicationName: 'RiotGraphs',
  authors: [{ name: 'RiotGraphs Team' }],
  creator: 'RiotGraphs',
  publisher: 'RiotGraphs',
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'RiotGraphs',
    title: 'RiotGraphs — Advanced competitive stats for the Riot ecosystem',
    description:
      'The most advanced stats platform for League of Legends, Valorant, TFT and LoR.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'RiotGraphs' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RiotGraphs',
    description:
      'Deep competitive analytics for the entire Riot Games ecosystem.',
    images: ['/og.png'],
    creator: '@riotgraphs',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: APP_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.variable, grotesk.variable, mono.variable, 'font-sans')}>
        <QueryProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster theme="dark" position="top-right" />
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  );
}
