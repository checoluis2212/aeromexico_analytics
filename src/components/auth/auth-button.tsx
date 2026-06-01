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
import { LogIn, LogOut, LayoutDashboard, User } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single()
          .then(({ data }) => setRole(data?.role ?? null));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single()
          .then(({ data }) => setRole(data?.role ?? null));
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const isInternal = role === 'admin' || role === 'consultant';
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

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
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium truncate">{user.email}</p>
          {role && <p className="text-[10px] text-muted-foreground">{roleLabels[role] ?? role}</p>}
        </div>
        <DropdownMenuSeparator />
        {isInternal && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push('/hub')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Hub de analytics
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
