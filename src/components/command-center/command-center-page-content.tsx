import { commandCenterContentClass } from '@/lib/layout/command-center';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Contenedor principal de páginas del Command Center (alineado al portal cliente). */
export function CommandCenterPageContent({ children, className }: Props) {
  return (
    <div
      className={cn(
        commandCenterContentClass,
        'py-6 sm:py-8 pb-10 w-full',
        className
      )}
    >
      {children}
    </div>
  );
}
