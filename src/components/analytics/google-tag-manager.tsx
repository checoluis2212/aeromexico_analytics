import { GoogleTagManager as NextGoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';
import { resolveGa4Id } from '@/lib/analytics/gtm-id';

type Props = {
  gtmId: string;
};

/**
 * Inicializa dataLayer y desactiva page_view automático de GA4/Google Tag
 * antes de que cargue gtm.js. Los page_view van solo por dataLayer manual.
 */
function DataLayerInit() {
  const ga4Id = resolveGa4Id();
  const disableAutoPageView = ga4Id
    ? `function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}',{send_page_view:false});`
    : '';

  return (
    <Script id="data-layer-init" strategy="beforeInteractive">
      {`window.dataLayer=window.dataLayer||[];${disableAutoPageView}`}
    </Script>
  );
}

export function GoogleTagManager({ gtmId }: Props) {
  return (
    <>
      <DataLayerInit />
      <NextGoogleTagManager gtmId={gtmId} />
    </>
  );
}

export function GoogleTagManagerNoScript({ gtmId }: Props) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
