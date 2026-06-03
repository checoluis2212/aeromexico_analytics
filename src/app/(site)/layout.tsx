import { SiteChrome } from '@/components/layout/site-chrome';
import { getSiteChromeBootstrap } from '@/lib/navigation/site-chrome-server';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const bootstrap = await getSiteChromeBootstrap();
  return <SiteChrome bootstrap={bootstrap}>{children}</SiteChrome>;
}
