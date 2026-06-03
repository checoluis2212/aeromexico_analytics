import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getPostLoginPath } from '@/lib/auth/access';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let profile = null;
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role, acc_role, email')
          .eq('id', user.id)
          .maybeSingle();
        profile = data;
      }

      const redirect = getPostLoginPath(profile, searchParams.get('redirect'));
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
