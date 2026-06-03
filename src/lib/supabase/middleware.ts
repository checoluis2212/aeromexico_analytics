import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getPostLoginPath, canAccessCommandCenter, isSergioAdmin, isSergioOnlyRoute } from '@/lib/auth/access';
import {
  hasPlatformAccess,
  isPlatformAccessExemptPath,
  PLATFORM_ACCESS_PATH,
  type ProfilePlatformAccess,
} from '@/lib/access-requests/platform-access';
import {
  ADMIN_AGENT_PATH,
  CLIENT_PORTAL_PREVIEW_PARAM,
  CLIENT_PORTAL_PREVIEW_VALUE,
} from '@/lib/ai/agent-scope';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const authRequiredPaths = ['/command-center', '/mis-pedidos', '/pedir', '/preguntale', '/perfil'];
  const needsAuth = authRequiredPaths.some((path) => pathname.startsWith(path));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && needsAuth && !isPlatformAccessExemptPath(pathname)) {
    const { data: accessProfile } = await supabase
      .from('profiles')
      .select('role, acc_role, email, platform_access_approved')
      .eq('id', user.id)
      .single();

    if (!hasPlatformAccess(accessProfile as ProfilePlatformAccess | null)) {
      const url = request.nextUrl.clone();
      url.pathname = PLATFORM_ACCESS_PATH;
      url.searchParams.set('state', 'pending');
      if (accessProfile?.email) url.searchParams.set('email', accessProfile.email);
      return NextResponse.redirect(url);
    }
  }

  if (user && pathname.startsWith('/command-center')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, acc_role, email')
      .eq('id', user.id)
      .single();

    if (!canAccessCommandCenter(profile)) {
      const url = request.nextUrl.clone();
      url.pathname = '/mis-pedidos';
      return NextResponse.redirect(url);
    }

    if (isSergioOnlyRoute(pathname) && !isSergioAdmin(profile)) {
      const url = request.nextUrl.clone();
      url.pathname = '/command-center/executive';
      return NextResponse.redirect(url);
    }
  }

  if (user && pathname === '/ai-agent') {
    const vista = request.nextUrl.searchParams.get(CLIENT_PORTAL_PREVIEW_PARAM);
    if (vista !== CLIENT_PORTAL_PREVIEW_VALUE) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, acc_role, email')
        .eq('id', user.id)
        .single();

      if (isSergioAdmin(profile)) {
        const url = request.nextUrl.clone();
        url.pathname = ADMIN_AGENT_PATH;
        url.search = '';
        return NextResponse.redirect(url);
      }
    }
  }

  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, acc_role, email, platform_access_approved')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = getPostLoginPath(profile, request.nextUrl.searchParams.get('redirect'));
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
