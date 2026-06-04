import { GoogleTagManager as NextGoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';
import { siteConfig } from '@/lib/constants';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? siteConfig.gtmContainerId;

/** Inicializa dataLayer antes de que GTM cargue (eventos del portal). */
function DataLayerInit() {
  return (
    <Script id="data-layer-init" strategy="beforeInteractive">
      {`window.dataLayer=window.dataLayer||[];`}
    </Script>
  );
}

export function GoogleTagManager() {
  return (
    <>
      <DataLayerInit />
      <NextGoogleTagManager gtmId={GTM_ID} />
    </>
  );
}

export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
