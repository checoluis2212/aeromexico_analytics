import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { ProfileSettings } from '@/components/account/profile-settings';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Mi perfil' };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/perfil');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  const email = profile?.email ?? user.email ?? '';

  return (
    <>
      <PageHeader
        badge="Mi cuenta"
        title="Perfil"
        description="Edita tus datos, contraseña y notificaciones Slack/Teams."
      />
      <Section className="py-8 sm:py-12" containerClassName="max-w-6xl">
        <ProfileSettings
          seed={{
            id: user.id,
            email,
            full_name: profile?.full_name ?? null,
          }}
        />
      </Section>
    </>
  );
}

