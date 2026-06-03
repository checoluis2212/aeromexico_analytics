import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/',
    '/about',
    '/contact',
    '/working-with-me',
    '/event-catalog',
    '/analytics-os',
    '/ai-insights',
    '/faq',
    '/glosario',
    '/command-center/:path*',
    '/mis-pedidos/:path*',
    '/pedir',
    '/preguntale',
    '/ai-agent',
    '/perfil/:path*',
    '/login',
    '/access',
  ],
};
