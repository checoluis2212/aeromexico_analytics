'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppRole } from '@/hooks/use-app-role';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAppRole();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        setItems(await res.json());
        return;
      }
      if (res.status === 401) setItems([]);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated]);

  const unread = items.filter((n) => !n.is_read).length;

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  function openNotification(n: Notification) {
    if (!n.is_read) markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
          <span className="text-sm font-medium">Notificaciones</span>
          {unread > 0 && (
            <button type="button" onClick={markAllRead} className="text-xs text-primary hover:underline">
              Marcar leídas
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">Sin notificaciones</p>
          ) : (
            items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  'block px-3 py-2.5 cursor-pointer rounded-none',
                  !n.is_read && 'bg-primary/5'
                )}
                onClick={() => openNotification(n)}
              >
                <p className="text-sm font-medium line-clamp-1">{n.title}</p>
                {n.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
