import { create } from 'zustand';
import { IAdmin } from '@/types';

interface AdminAuthState {
  admin: IAdmin | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAdmin: (admin: IAdmin) => void;
  clearAdmin: () => void;
  setInitialized: (v: boolean) => void;
}

export const useAdminStore = create<AdminAuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  isInitialized: false,
  setAdmin: (admin) => set({ admin, isAuthenticated: true }),
  clearAdmin: () => set({ admin: null, isAuthenticated: false }),
  setInitialized: (v) => set({ isInitialized: v }),
}));
