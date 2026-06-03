'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ClientSidebar } from '@/components/layout/client-sidebar';
import { InternalSidebar } from '@/components/layout/internal-sidebar';
import { CommandCenterProvider } from '@/components/command-center/command-center-context';
import type { SiteChromeBootstrap } from '@/lib/navigation/site-chrome-server';
import type { AppRole } from '@/lib/auth/access';
import {
  isAuthChromeExempt,
  isCommandCenterPath,
  shouldShowClientSidebar,
  shouldShowInternalSidebar,
} from '@/lib/navigation/workspaces';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  bootstrap: SiteChromeBootstrap;
};

export function SiteChrome({ children, bootstrap }: Props) {
  const pathname = usePathname();

  if (isCommandCenterPath(pathname)) {
    return <>{children}</>;
  }

  const { isAuthenticated, appRole, accRole, userLabel } = bootstrap;
  const clientWorkspace = shouldShowClientSidebar(pathname, appRole, isAuthenticated);
  const internalWorkspace = shouldShowInternalSidebar(pathname, appRole, isAuthenticated);
  const portalShell = clientWorkspace || internalWorkspace;
  const hideFooter = portalShell || isAuthChromeExempt(pathname);

  const resolvedRole: AppRole = appRole ?? 'client';

  const shell = (
    <>
      <Header
        clientWorkspace={clientWorkspace}
        internalWorkspace={internalWorkspace}
        bootstrap={bootstrap}
      />
      <div className={cn('flex flex-1 min-h-0 w-full', portalShell && 'min-h-[calc(100vh-3.5rem)]')}>
        {clientWorkspace && <ClientSidebar userLabel={userLabel} />}
        {internalWorkspace && <InternalSidebar />}
        <main
          className={cn(
            'flex-1 min-w-0 flex flex-col min-h-0',
            portalShell ? 'overflow-y-auto' : undefined
          )}
        >
          {children}
        </main>
      </div>
      {!hideFooter && <Footer />}
    </>
  );

  if (internalWorkspace) {
    return (
      <CommandCenterProvider appRole={resolvedRole} accRole={accRole}>
        {shell}
      </CommandCenterProvider>
    );
  }

  return shell;
}
