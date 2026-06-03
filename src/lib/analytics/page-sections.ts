export type PortalSection = 'access' | 'client' | 'command_center' | 'resources' | 'marketing';

export type PageSectionMeta = {
  portal_section: PortalSection;
  page_type: string;
  cc_area?: string;
  content_type?: string;
};

export function resolvePageSection(pathname: string): PageSectionMeta {
  if (pathname === '/access') {
    return { portal_section: 'access', page_type: 'pre_entry' };
  }
  if (pathname === '/login' || pathname === '/recuperar') {
    return { portal_section: 'access', page_type: 'auth' };
  }
  if (pathname.startsWith('/command-center')) {
    const cc_area = pathname.split('/')[2] ?? 'home';
    return { portal_section: 'command_center', page_type: 'workspace', cc_area };
  }
  if (
    pathname === '/pedir' ||
    pathname.startsWith('/preguntale') ||
    pathname.startsWith('/mis-pedidos')
  ) {
    const page_type = pathname.startsWith('/mis-pedidos') ? 'request_detail' : 'requests';
    return {
      portal_section: 'client',
      page_type: pathname === '/pedir' ? 'request_hub' : page_type,
    };
  }
  if (pathname.startsWith('/ai-agent')) {
    return { portal_section: 'client', page_type: 'ai_agent' };
  }
  if (pathname.startsWith('/perfil')) {
    return { portal_section: 'client', page_type: 'profile' };
  }
  if (pathname === '/event-catalog') {
    return { portal_section: 'resources', page_type: 'event_catalog', content_type: 'event_catalog' };
  }
  if (pathname === '/glosario') {
    return { portal_section: 'resources', page_type: 'glossary', content_type: 'glossary' };
  }
  if (pathname === '/faq') {
    return { portal_section: 'resources', page_type: 'faq', content_type: 'faq' };
  }
  if (pathname === '/analytics-os') {
    return { portal_section: 'resources', page_type: 'analytics_os', content_type: 'analytics_os' };
  }
  if (pathname === '/' || pathname === '/about' || pathname === '/working-with-me' || pathname === '/contact') {
    return { portal_section: 'marketing', page_type: pathname === '/' ? 'home' : pathname.slice(1) };
  }
  return { portal_section: 'marketing', page_type: 'other' };
}
