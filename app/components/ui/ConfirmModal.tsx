'use client';

import { ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

const variantConfig: Record<Variant, {
  iconBg: string;
  iconColor: string;
  btnClass: string;
  Icon: typeof AlertTriangle;
}> = {
  danger: {
    iconBg:    'bg-red-100 dark:bg-red-950',
    iconColor: 'text-red-600 dark:text-red-400',
    btnClass:  'btn btn-danger',
    Icon:      XCircle,
  },
  warning: {
    iconBg:    'bg-amber-100 dark:bg-amber-950',
    iconColor: 'text-amber-600 dark:text-amber-400',
    btnClass:  'btn btn-primary',
    Icon:      AlertTriangle,
  },
  info: {
    iconBg:    'bg-blue-100 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
    btnClass:  'btn btn-primary',
    Icon:      Info,
  },
  success: {
    iconBg:    'bg-green-100 dark:bg-green-950',
    iconColor: 'text-green-600 dark:text-green-400',
    btnClass:  'btn btn-primary',
    Icon:      CheckCircle,
  },
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  if (!open) return null;

  const { iconBg, iconColor, btnClass, Icon } = variantConfig[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={loading}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>

        {/* Text */}
        <div className="text-center">
          <p id="confirm-modal-title" className="font-semibold text-gray-900 dark:text-white text-base">
            {title}
          </p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* Optional custom content */}
        {children && <div className="w-full">{children}</div>}

        {/* Actions */}
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-outline flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(btnClass, 'flex-1')}
          >
            {loading ? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
