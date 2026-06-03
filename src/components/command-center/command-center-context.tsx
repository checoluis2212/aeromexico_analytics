'use client';

import { createContext, useContext } from 'react';
import type { AppRole } from '@/lib/auth/access';

type CommandCenterContextValue = {
  appRole: AppRole;
  accRole: string | null;
};

const CommandCenterContext = createContext<CommandCenterContextValue>({
  appRole: 'client',
  accRole: null,
});

export function CommandCenterProvider({
  appRole,
  accRole = null,
  children,
}: {
  appRole: AppRole;
  accRole?: string | null;
  children: React.ReactNode;
}) {
  return (
    <CommandCenterContext.Provider value={{ appRole, accRole }}>
      {children}
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenterRole() {
  return useContext(CommandCenterContext).appRole;
}

export function useAccRole() {
  return useContext(CommandCenterContext).accRole;
}

export function useIsSergioAdmin() {
  return useContext(CommandCenterContext).appRole === 'sergio_admin';
}
