'use client';

import { useState, useEffect } from 'react';
import { useSessionExpiration } from '@/lib/useSessionExpiration';
import { Clock, LogOut, Shield } from 'lucide-react';

export function SessionExpirationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState<string>('5:00');
  const { handleStayLoggedIn, handleLogout } = useSessionExpiration();

  useEffect(() => {
    // Listen for session expiration warning event
    const handleWarning = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsOpen(true);
      setTimeRemaining(customEvent.detail.timeRemaining);
    };

    // Listen for modal close event
    const handleClose = () => {
      setIsOpen(false);
    };

    window.addEventListener('sessionExpirationWarning', handleWarning);
    window.addEventListener('closeSessionExpirationModal', handleClose);

    return () => {
      window.removeEventListener('sessionExpirationWarning', handleWarning);
      window.removeEventListener('closeSessionExpirationModal', handleClose);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);
          handleLogout();
          setIsOpen(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeRemaining, handleLogout]);

  // Format time as MM:SS
  useEffect(() => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, [timeRemaining]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex items-center gap-3">
          <Clock className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Session Expiring Soon</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your session will expire in
          </p>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-orange-500 font-mono mb-2">
              {displayTime}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click &quot;Stay Logged In&quot; to continue working
            </p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            For your security, we will automatically log you out when the timer reaches zero.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex gap-3">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="flex-1 py-2 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <button
            onClick={() => {
              handleStayLoggedIn();
              setIsOpen(false);
            }}
            className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Shield className="w-4 h-4" />
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
