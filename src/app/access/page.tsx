import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { PreEntryPortal } from '@/components/access/pre-entry-portal';
import { getAccessRequestByEmail } from '@/lib/access-requests/submit-request';
import { hasPlatformAccess, type ProfilePlatformAccess } from '@/lib/access-requests/platform-access';
import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<{ state?: string; email?: string; intent?: string }>;
};

function AccessPortalFallback() {
  return (
    <div className="access-portal-shell min-h-screen flex items-center justify-center text-muted-foreground text-sm">
      Cargando…
    </div>
  );
}

async function AccessPageContent({ searchParams }: PageProps) {
  const { state, email: emailParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, acc_role, email, platform_access_approved')
      .eq('id', user.id)
      .maybeSingle();

    if (hasPlatformAccess(profile as ProfilePlatformAccess | null)) {
      redirect('/mis-pedidos');
    }

    const email = profile?.email ?? user.email ?? emailParam ?? '';
    if (state === 'pending' || email) {
      const request = email ? await getAccessRequestByEmail(email) : null;
      if (request?.status === 'pending' || state === 'pending') {
        return <PreEntryPortal initialView="pending" initialEmail={email} />;
      }
      if (request?.status === 'approved') {
        redirect('/login');
      }
    }
  }

  if (emailParam) {
    const request = await getAccessRequestByEmail(emailParam);
    if (request?.status === 'pending') {
      return <PreEntryPortal initialView="pending" initialEmail={emailParam} />;
    }
  }

  return <PreEntryPortal initialView="form" initialEmail={emailParam ?? ''} />;
}

export default function AccessPage(props: PageProps) {
  return (
    <Suspense fallback={<AccessPortalFallback />}>
      <AccessPageContent {...props} />
    </Suspense>
  );
}
