import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Footer, Header, MAIN_ID, SkipLink, TabBar } from '@/components/layout';
import { ServiceWorker } from '@/components/pwa/ServiceWorker';
import { ToastProvider } from '@/components/ui';
import { site } from '@/config/site';
import { env, withBasePath } from '@/lib/env';
import { caveat, inter } from '@/lib/fonts';
import '@/styles/index.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: site.nombre, template: `%s · ${site.nombre}` },
  description: site.descripcion,
  applicationName: site.nombre,
  // Mientras la web sea privada no se indexa (CLAUDE.md § Convenciones).
  robots: env.siteMode === 'private' ? { index: false, follow: false } : undefined,
  icons: {
    icon: [
      { url: withBasePath('/brand/favicon/favicon.ico'), sizes: '48x48' },
      { url: withBasePath('/brand/favicon/favicon-32.png'), type: 'image/png', sizes: '32x32' },
    ],
    apple: withBasePath('/brand/favicon/apple-touch-icon.png'),
  },
  appleWebApp: { capable: true, title: site.nombreCorto, statusBarStyle: 'default' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: site.nombre,
    images: [{ url: withBasePath('/brand/og/og-default.jpg'), width: 1200, height: 630 }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: site.colores.tema },
    { media: '(prefers-color-scheme: dark)', color: site.colores.temaOscuro },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${caveat.variable}`}>
      <body>
        <ToastProvider>
          <div className="pagina">
            <SkipLink />
            <Header />
            <main id={MAIN_ID} tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <TabBar />
          </div>
        </ToastProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
