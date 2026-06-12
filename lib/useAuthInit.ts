import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';

export function useAuthInit() {
  const { setUser, setInitialized, setAuthLoading, isInitialized } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;
      if (pathname.startsWith('/admin')) {
        setInitialized(true);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const response = await apiClient.getCurrentUser();
        if (response.success && response.data) {
          const user = response.data;
          const userType = response.data.type === 'company' ? 'company' : 'user';
          setUser(user, userType, user.tokenExpiry);
          console.log('[Auth Init] User restored:', userType);
        } else {
          console.log('[Auth Init] No user data in response');
        }
      } catch (error) {
        // User is not authenticated, that's fine
        console.log('[Auth Init] No active session found', error instanceof Error ? error.message : '');
      } finally {
        setInitialized(true);
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, [isInitialized, setUser, setInitialized, setAuthLoading, pathname]);
}
