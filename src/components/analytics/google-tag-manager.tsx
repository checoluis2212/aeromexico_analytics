import { GoogleTagManager as NextGoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';

type Props = {
  gtmId: string;
};

/** Inicializa dataLayer antes de que GTM cargue (eventos del portal). */
function DataLayerInit() {
  return (
    <Script id="data-layer-init" strategy="beforeInteractive">
      {`window.dataLayer=window.dataLayer||[];`}
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
