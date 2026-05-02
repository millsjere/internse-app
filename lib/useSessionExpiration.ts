import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface SessionExpirationModalState {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function useSessionExpiration() {
  const { tokenExpiry, setUser, logout } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (!tokenExpiry) return;

    const now = Date.now();
    const timeUntilExpiry = tokenExpiry - now;
    const fiveMinutesInMs = 5 * 60 * 1000;

    // If token already expired, logout
    if (timeUntilExpiry <= 0) {
      logout();
      toast.error('Your session has expired. Please login again.');
      return;
    }

    // Show warning 5 minutes before expiry
    const warningTime = timeUntilExpiry - fiveMinutesInMs;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        // Dispatch event to show modal
        window.dispatchEvent(
          new CustomEvent('sessionExpirationWarning', {
            detail: { timeRemaining: fiveMinutesInMs },
          })
        );
      }, warningTime);
    } else {
      // Less than 5 minutes left, show warning immediately
      window.dispatchEvent(
        new CustomEvent('sessionExpirationWarning', {
          detail: { timeRemaining: Math.max(timeUntilExpiry, 0) },
        })
      );
    }

    // Auto-logout after token expires
    timeoutRef.current = setTimeout(() => {
      logout();
      toast.error('Your session has expired. Please login again.');
    }, timeUntilExpiry);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [tokenExpiry, logout]);

  // Function to refresh token and stay logged in
  const handleStayLoggedIn = async () => {
    try {
      const response = await apiClient.refreshToken();
      if (response.success && response.data?.tokenExpiry) {
        // Update token expiry in store
        const { user, userType } = useAuthStore.getState();
        setUser(user, userType, response.data.tokenExpiry);
        toast.success('Session extended. You are logged in for another 7 days.');
        
        // Close modal by dispatching event
        window.dispatchEvent(new CustomEvent('closeSessionExpirationModal'));
      }
    } catch (error) {
      toast.error('Failed to refresh session. Please try again.');
    }
  };

  // Function to logout
  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Continue even if logout endpoint fails
    } finally {
      logout();
      localStorage.removeItem('cid_jwt');
      localStorage.removeItem('uid_jwt');
      localStorage.removeItem('tokenExpiry');
      toast.success('You have been logged out.');
    }
  };

  return {
    handleStayLoggedIn,
    handleLogout,
  };
}
