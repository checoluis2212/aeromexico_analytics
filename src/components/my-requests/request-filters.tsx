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

const USER_LABELS: Record<string, string> = { all: 'Todos los usuarios' };
const AREA_LABELS: Record<string, string> = { all: 'Todas las áreas' };
const PRIORITY_LABELS: Record<string, string> = { all: 'Todas las prioridades' };
const TYPE_LABELS: Record<string, string> = { all: 'Todos los tipos' };
const PERIOD_LABELS: Record<string, string> = {
  all: 'Todo el tiempo',
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
};

function FilterSelect({
  label,
  value,
  display,
  onChange,
  children,
}: {
  label: string;
  value: string;
  display: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={(v) => onChange(v ?? 'all')}>
        <SelectTrigger className="mt-1 h-9">
          <SelectValue>{display}</SelectValue>
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

interface RequestFiltersProps {
  filters: RequestFilterState;
  onChange: (next: RequestFilterState) => void;
  users?: { email: string; name: string }[];
  areas?: string[];
  showUserFilter?: boolean;
  hideStatusFilter?: boolean;
}

export function RequestFilters({
  filters,
  onChange,
  users = [],
  areas = [],
  showUserFilter = false,
  hideStatusFilter = false,
}: RequestFiltersProps) {
  const areaOptions = areas.length > 0 ? areas : [...requestAreas];

  const userDisplay =
    filters.user === 'all'
      ? USER_LABELS.all
      : users.find((u) => u.email === filters.user)?.name ?? filters.user;

  const gridCols = hideStatusFilter
    ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7';

  return (
    <div className="space-y-3">
      <div
        className={`grid grid-cols-1 ${gridCols} gap-3 p-4 rounded-xl border border-border/60 bg-card/30`}
      >
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
          <FilterSelect
            label="Usuario"
            value={filters.user}
            display={userDisplay}
            onChange={(v) => onChange({ ...filters, user: v })}
          >
            <SelectItem value="all">{USER_LABELS.all}</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.email} value={u.email}>
                {u.name}
              </SelectItem>
            ))}
          </FilterSelect>
        )}

        {!hideStatusFilter && (
          <FilterSelect
            label="Estado"
            value={filters.status}
            display={
              filters.status === 'all'
                ? 'Todos'
                : filters.status === 'pending'
                  ? 'Pendientes'
                  : 'Completados'
            }
            onChange={(v) => onChange({ ...filters, status: v as RequestFilterState['status'] })}
          >
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="done">Completados</SelectItem>
          </FilterSelect>
        )}

        <FilterSelect
          label="Área"
          value={filters.area}
          display={AREA_LABELS[filters.area] ?? filters.area}
          onChange={(v) => onChange({ ...filters, area: v })}
        >
          <SelectItem value="all">{AREA_LABELS.all}</SelectItem>
          {areaOptions.map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Prioridad"
          value={filters.priority}
          display={
            PRIORITY_LABELS[filters.priority] ??
            requestPriorities.find((p) => p.value === filters.priority)?.label ??
            filters.priority
          }
          onChange={(v) => onChange({ ...filters, priority: v })}
        >
          <SelectItem value="all">{PRIORITY_LABELS.all}</SelectItem>
          {requestPriorities.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Tipo"
          value={filters.type}
          display={
            TYPE_LABELS[filters.type] ??
            requestTypes.find((t) => t.value === filters.type)?.label ??
            filters.type
          }
          onChange={(v) => onChange({ ...filters, type: v })}
        >
          <SelectItem value="all">{TYPE_LABELS.all}</SelectItem>
          {requestTypes.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Período"
          value={filters.dateRange}
          display={PERIOD_LABELS[filters.dateRange] ?? filters.dateRange}
          onChange={(v) => onChange({ ...filters, dateRange: v as RequestFilterState['dateRange'] })}
        >
          <SelectItem value="all">{PERIOD_LABELS.all}</SelectItem>
          <SelectItem value="7d">{PERIOD_LABELS['7d']}</SelectItem>
          <SelectItem value="30d">{PERIOD_LABELS['30d']}</SelectItem>
          <SelectItem value="90d">{PERIOD_LABELS['90d']}</SelectItem>
        </FilterSelect>
      </div>
    </div>
  );
}
