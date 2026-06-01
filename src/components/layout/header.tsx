import Link from 'next/link';
import { siteConfig, navItems, hubNavItems } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Radar } from 'lucide-react';
import { AuthButton } from '@/components/auth/auth-button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
            <Radar className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">{siteConfig.name}</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:block">Consultoría en analytics</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/50 flex items-center gap-1.5"
            >
              {item.label}
              {'badge' in item && item.badge && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {hubNavItems.slice(0, 2).map((item) => (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/request-center">Solicitar trabajo</Link>
          </Button>
          <AuthButton />
        </div>

        <Sheet>
          <SheetTrigger className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <nav className="flex flex-col gap-1 mt-8">
              {[...navItems, ...hubNavItems].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2.5 text-sm rounded-md hover:bg-secondary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
