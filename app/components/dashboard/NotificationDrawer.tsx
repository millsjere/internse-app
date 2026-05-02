'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useNotificationStore, useAuthStore } from '@/lib/store';
import { cn, formatRelativeDate } from '@/lib/utils';
import { Bell, CheckCheck, Trash2, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { INotification } from '@/types';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { userType } = useAuthStore();
  const { notifications, markAsRead, removeNotification } = useNotificationStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const isCompany = userType === 'company';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const notifType = isCompany ? 'company' : 'user';
  const unread = notifications.filter((n) => !n.read);

  async function handleMarkRead(id: string) {
    try {
      await apiClient.markNotificationAsRead(id, notifType);
      markAsRead(id);
    } catch {
      toast.error('Failed to mark as read');
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiClient.deleteNotification(id, notifType);
      removeNotification(id);
    } catch {
      toast.error('Failed to delete');
    }
  }

  async function handleMarkAllRead() {
    await Promise.allSettled(
      unread.map((n) =>
        apiClient.markNotificationAsRead(n._id, notifType).then(() => markAsRead(n._id))
      )
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 z-990 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-950',
          'shadow-2xl z-50 flex flex-col',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h2>
            {unread.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                {unread.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn btn-ghost btn-sm gap-1.5 text-xs"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Read all
              </button>
            )}
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon btn-sm ml-1"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">No notifications</p>
              <p className="text-xs text-gray-400">Updates will appear here.</p>
            </div>
          ) : (
            <ul>
              {notifications.map((n: INotification) => (
                <li
                  key={n._id}
                  className={cn(
                    'flex items-start gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800/60 last:border-0',
                    !n.read && 'bg-blue-50/60 dark:bg-blue-950/20'
                  )}
                >
                  {/* Dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <span
                      className={cn(
                        'block w-2 h-2 rounded-full',
                        n.read ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-500'
                      )}
                    />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">{formatRelativeDate(n.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 mt-0.5">
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={onClose}
                        className="btn btn-ghost btn-icon btn-sm"
                        aria-label="View"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n._id)}
                        className="btn btn-ghost btn-icon btn-sm"
                        aria-label="Mark as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="btn btn-ghost btn-icon btn-sm text-red-400 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
