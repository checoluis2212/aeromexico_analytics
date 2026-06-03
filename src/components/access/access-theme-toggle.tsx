'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACCESS_PORTAL_COPY } from '@/lib/access-requests/constants';

type Props = {
  theme: 'light' | 'dark';
  onChange: (theme: 'light' | 'dark') => void;
};

export function AccessThemeToggle({ theme, onChange }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 text-xs"
      onClick={() => onChange(theme === 'light' ? 'dark' : 'light')}
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-3.5 w-3.5" />
          {ACCESS_PORTAL_COPY.themeDark}
        </>
      ) : (
        <>
          <Sun className="h-3.5 w-3.5" />
          {ACCESS_PORTAL_COPY.themeLight}
        </>
      )}
    </Button>
  );
}
