import { assertSergioAdmin } from '@/lib/auth/guards';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
import { UsersAdminPanel } from '@/components/admin/users-admin-panel';

export const metadata = { title: 'Usuarios y roles' };

export default async function UsuariosAdminPage() {
  await assertSergioAdmin();

  return (
    <>
      <CommandCenterTopBar
        title="Usuarios"
        subtitle="Quién entra al centro, quién pide pedidos y quién opera contigo"
      />
      <CommandCenterPageContent>
        <UsersAdminPanel />
      </CommandCenterPageContent>
    </>
  );
}
