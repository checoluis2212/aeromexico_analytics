import { clientNavPrimary } from '@/lib/constants';

type ClientNavItem = (typeof clientNavPrimary)[number];

export function getClientNavMatchPaths(item: ClientNavItem): readonly string[] {
  return 'matchPaths' in item && item.matchPaths ? item.matchPaths : [item.href];
}

export function isClientNavItemActive(pathname: string, item: ClientNavItem): boolean {
  if (item.href === '/mis-pedidos') {
    return (
      pathname === '/mis-pedidos' ||
      (pathname.startsWith('/mis-pedidos/') && !pathname.startsWith('/mis-pedidos/archivo'))
    );
  }
  return getClientNavMatchPaths(item).some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
