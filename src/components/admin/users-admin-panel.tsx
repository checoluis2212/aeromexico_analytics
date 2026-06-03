'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { APP_ROLE_LABELS, type AppRole } from '@/lib/auth/access';
import { ACC_ROLES } from '@/types/command-center';
import { roleLabels } from '@/lib/constants';
import { Loader2, Save, Search, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: string;
  acc_role: string | null;
  department: string | null;
  created_at: string;
  app_role: AppRole;
};

const USER_ROLES = ['admin', 'consultant', 'client', 'viewer'] as const;

const ACC_ROLE_OPTIONS = Object.keys(ACC_ROLES) as (keyof typeof ACC_ROLES)[];

const APP_ROLE_BADGE: Record<AppRole, string> = {
  sergio_admin: 'bg-primary/15 text-primary border-primary/30',
  stakeholder: 'bg-signal/15 text-signal border-signal/30',
  client: 'bg-secondary text-muted-foreground border-border/50',
};

export function UsersAdminPanel() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { role: string; acc_role: string | null }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profiles');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar');
      setProfiles(json.profiles ?? []);
      setDrafts({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.email.toLowerCase().includes(q) ||
        (p.full_name?.toLowerCase().includes(q) ?? false) ||
        (p.company?.toLowerCase().includes(q) ?? false)
    );
  }, [profiles, search]);

  function getDraft(p: ProfileRow) {
    return drafts[p.id] ?? { role: p.role, acc_role: p.acc_role };
  }

  function setDraft(id: string, patch: Partial<{ role: string; acc_role: string | null }>) {
    const current = profiles.find((p) => p.id === id);
    if (!current) return;
    const base = drafts[id] ?? { role: current.role, acc_role: current.acc_role };
    const next = { ...base, ...patch };
    if (next.role === 'client' || next.role === 'viewer') {
      next.acc_role = null;
    }
    setDrafts((prev) => ({ ...prev, [id]: next }));
  }

  async function save(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    try {
      const res = await fetch('/api/admin/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          role: draft.role,
          acc_role: draft.acc_role,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'No se pudo guardar');

      if (json.profile) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...json.profile } : p))
        );
      }
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.success('Rol actualizado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Cargando usuarios…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o área…"
          className="pl-9"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        {' · '}
        Solo tú (admin) puede cambiar roles. Los clientes usan <strong>Mis pedidos</strong>; los internos,{' '}
        <strong>Centro Analytics</strong>.
      </p>

      <div className="space-y-3">
        {filtered.map((p) => {
          const draft = getDraft(p);
          const dirty = Boolean(drafts[p.id]);
          const isInternalRole = draft.role !== 'client' && draft.role !== 'viewer';

          return (
            <Card key={p.id} className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {p.full_name?.trim() || p.email}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.email}</p>
                    {p.company && (
                      <p className="text-[11px] text-muted-foreground mt-1">{p.company}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={APP_ROLE_BADGE[p.app_role]}>
                    {APP_ROLE_LABELS[p.app_role]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Rol base
                    </label>
                    <Select
                      value={draft.role}
                      onValueChange={(v) => v && setDraft(p.id, { role: v })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {roleLabels[r] ?? r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Rol ACC (interno)
                    </label>
                    <Select
                      value={draft.acc_role ?? 'none'}
                      onValueChange={(v) =>
                        v && setDraft(p.id, { acc_role: v === 'none' ? null : v })
                      }
                      disabled={!isInternalRole}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder={isInternalRole ? 'Elegir…' : '—'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Ninguno —</SelectItem>
                        {ACC_ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ACC_ROLES[r].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-[11px] text-muted-foreground">
                    Alta: {format(new Date(p.created_at), 'd MMM yyyy', { locale: es })}
                    {draft.role === 'admin' && (
                      <>
                        {' · '}
                        <Shield className="h-3 w-3 inline align-text-bottom" /> Admin completo
                      </>
                    )}
                  </p>
                  {dirty && (
                    <Button
                      size="sm"
                      className="h-8"
                      disabled={savingId === p.id}
                      onClick={() => save(p.id)}
                    >
                      {savingId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <Save className="h-4 w-4 mr-1.5" />
                      )}
                      Guardar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
