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
        }
      } catch (error) {
        // User is not authenticated, that's fine
        console.log('No active session found');
      } finally {
        setInitialized(true);
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, [isInitialized, setUser, setInitialized, setAuthLoading]);
}
