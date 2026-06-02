import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getPostLoginPath, hasInternalAccess } from '@/lib/auth/access';

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

  const authRequiredPaths = ['/hub', '/command-center', '/mis-pedidos'];
  const needsAuth = authRequiredPaths.some((path) => pathname.startsWith(path));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname.startsWith('/hub') || pathname.startsWith('/command-center'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, acc_role')
      .eq('id', user.id)
      .single();

    if (!hasInternalAccess(profile)) {
      const url = request.nextUrl.clone();
      url.pathname = '/mis-pedidos';
      return NextResponse.redirect(url);
    }
  }

  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, acc_role')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = getPostLoginPath(profile, request.nextUrl.searchParams.get('redirect'));
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
