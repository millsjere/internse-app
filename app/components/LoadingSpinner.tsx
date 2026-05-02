'use client';

import { Loader } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}
