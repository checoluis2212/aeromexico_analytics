import Link from 'next/link';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { Card, CardContent } from '@/components/ui/card';
import { ACC_NAV_RESOURCES } from '@/types/command-center';
import {
  Zap, BookOpen, Library, TrendingUp, Award, User,
  ChevronRight,
} from 'lucide-react';

export const metadata = { title: 'Más recursos' };

const iconMap = {
  Zap: Zap,
  BookOpen: BookOpen,
  Library: Library,
  TrendingUp: TrendingUp,
  Award: Award,
  User: User,
};

export default function ResourcesPage() {
  return (
    <>
      <CommandCenterTopBar
        title="Más recursos"
        subtitle="Documentación y herramientas del equipo — solo cuando las necesites"
      />

      <div className="p-5 max-w-3xl">
        <p className="text-sm text-muted-foreground mb-6">
          No tienes que conocer todo esto de memoria. Guarda esta página y vuelve cuando te haga falta.
        </p>

        <div className="grid gap-2">
          {ACC_NAV_RESOURCES.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? BookOpen;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="bg-card/30 border-border/40 hover:border-primary/25 hover:bg-card/50 transition-all">
                  <CardContent className="flex items-center gap-4 py-4 px-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.hint}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
