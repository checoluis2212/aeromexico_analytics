import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { pedirLoginRedirect } from '@/lib/ai/assistant-modes';
import { PedirHubContent } from '@/components/pedir/pedir-hub-content';

export const metadata = {
  title: 'Pedir con IA',
  description:
    'Elige qué necesitas de analytics — pedido guiado con IA o consultor — antes de empezar con Sergio Burgos.',
};

export default async function PedirPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(pedirLoginRedirect());

  return <PedirHubContent />;
}
