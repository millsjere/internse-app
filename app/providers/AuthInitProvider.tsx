'use client';

import { ReactNode } from 'react';
import { useAuthInit } from '@/lib/useAuthInit';
import { useSessionExpiration } from '@/lib/useSessionExpiration';
import { SessionExpirationModal } from '@/app/components/SessionExpirationModal';

export function AuthInitProvider({ children }: { children: ReactNode }) {
  useAuthInit();
  useSessionExpiration();
  
  return (
    <>
      {children}
      <SessionExpirationModal />
    </>
  );
}
