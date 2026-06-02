'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { roleLabels } from '@/lib/constants';
import { getAppRole, APP_ROLE_LABELS, type AppRole } from '@/lib/auth/access';
import { LogIn, LogOut, LayoutDashboard, User, Inbox, Shield } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [accRole, setAccRole] = useState<string | null>(null);
  const [appRole, setAppRole] = useState<AppRole>('client');

  useEffect(() => {
    const supabase = createClient();

    function loadProfile(userId: string) {
      supabase.from('profiles').select('role, acc_role, email').eq('id', userId).single()
        .then(({ data }) => {
          const profile = data ? { role: data.role, acc_role: data.acc_role, email: data.email } : null;
          setRole(data?.role ?? null);
          setAccRole(data?.acc_role ?? null);
          setAppRole(getAppRole(profile));
        });
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) loadProfile(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setRole(null); setAccRole(null); setAppRole('client'); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';
  const ccHome = appRole === 'sergio_admin' ? '/command-center/admin' : appRole === 'stakeholder' ? '/command-center/executive' : null;

  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <a href="/login">
          <LogIn className="mr-1.5 h-4 w-4" />
          Entrar
        </a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-border hover:ring-primary/40 transition-all">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium truncate">{user.email}</p>
          <p className="text-[10px] text-muted-foreground">{APP_ROLE_LABELS[appRole]}</p>
          {role && role !== 'client' && (
            <p className="text-[10px] text-muted-foreground">{roleLabels[role] ?? role}</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/mis-pedidos')}>
          <Inbox className="mr-2 h-4 w-4" />
          Mis pedidos
        </DropdownMenuItem>
        {ccHome && (
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(ccHome)}>
            {appRole === 'sergio_admin' ? (
              <Shield className="mr-2 h-4 w-4" />
            ) : (
              <LayoutDashboard className="mr-2 h-4 w-4" />
            )}
            {appRole === 'sergio_admin' ? 'Panel Sergio' : 'Centro Analytics'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled>
          <User className="mr-2 h-4 w-4" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
