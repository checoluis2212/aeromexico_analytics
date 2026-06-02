'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { requestAreas, requestPriorities, requestTypes } from '@/lib/constants';
import type { RequestFilterState } from '@/lib/requests/filters';
import { Search } from 'lucide-react';

interface RequestFiltersProps {
  filters: RequestFilterState;
  onChange: (next: RequestFilterState) => void;
  users?: { email: string; name: string }[];
  areas?: string[];
  showUserFilter?: boolean;
}

export function RequestFilters({
  filters,
  onChange,
  users = [],
  areas = [],
  showUserFilter = false,
}: RequestFiltersProps) {
  const areaOptions = areas.length > 0 ? areas : [...requestAreas];

  return (
    <div className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 p-4 rounded-xl border border-border/60 bg-card/30">
      <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
        <Label className="text-xs text-muted-foreground">Buscar</Label>
        <div className="relative mt-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Título, nombre, correo…"
            value={filters.q}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {showUserFilter && (
        <div>
          <Label className="text-xs text-muted-foreground">Usuario</Label>
          <Select
            value={filters.user}
            onValueChange={(v) => onChange({ ...filters, user: v ?? 'all' })}
          >
            <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.email} value={u.email}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label className="text-xs text-muted-foreground">Estado</Label>
        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: (v as RequestFilterState['status']) ?? 'all' })}
        >
          <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="done">Completados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Área</Label>
        <Select
          value={filters.area}
          onValueChange={(v) => onChange({ ...filters, area: v ?? 'all' })}
        >
          <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {areaOptions.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Prioridad</Label>
        <Select
          value={filters.priority}
          onValueChange={(v) => onChange({ ...filters, priority: v ?? 'all' })}
        >
          <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {requestPriorities.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <Select
          value={filters.type}
          onValueChange={(v) => onChange({ ...filters, type: v ?? 'all' })}
        >
          <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {requestTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Período</Label>
        <Select
          value={filters.dateRange}
          onValueChange={(v) => onChange({ ...filters, dateRange: (v as RequestFilterState['dateRange']) ?? 'all' })}
        >
          <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el tiempo</SelectItem>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    </div>
  );
}
