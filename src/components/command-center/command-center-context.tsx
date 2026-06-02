'use client';

import { createContext, useContext } from 'react';
import type { AppRole } from '@/lib/auth/access';

type CommandCenterContextValue = {
  appRole: AppRole;
};

const CommandCenterContext = createContext<CommandCenterContextValue>({
  appRole: 'client',
});

export function CommandCenterProvider({
  appRole,
  children,
}: {
  appRole: AppRole;
  children: React.ReactNode;
}) {
  return (
    <CommandCenterContext.Provider value={{ appRole }}>
      {children}
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenterRole() {
  return useContext(CommandCenterContext).appRole;
}

export function useIsSergioAdmin() {
  return useContext(CommandCenterContext).appRole === 'sergio_admin';
}
