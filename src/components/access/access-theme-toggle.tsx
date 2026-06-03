'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-3.5 w-3.5" />
          Dark
        </>
      ) : (
        <>
          <Sun className="h-3.5 w-3.5" />
          Light
        </>
      )}
    </Button>
  );
}
