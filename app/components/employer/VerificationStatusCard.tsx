'use client';

import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface VerificationStatus {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  canPostJobs: boolean;
  rejectionReason?: string;
}

export function VerificationStatusCard({ verification }: { verification: VerificationStatus }) {
  if (verification.status === 'approved') {
    return (
      <div className="card bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">Verified ✓</h3>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-3">
              Your company is verified and approved to post jobs.
            </p>
            <Link href="/employer/jobs/post" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
              Post a Job →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (verification.status === 'pending') {
    return (
      <div className="card bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Verification Pending</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Your business verification is under review. This typically takes 24-48 hours.
            </p>
            <Link href="/employer/verification" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              View Status →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (verification.status === 'rejected') {
    return (
      <div className="card bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 dark:text-red-100 mb-1">Verification Rejected</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              {verification.rejectionReason || 'Your verification was rejected. Please review and resubmit.'}
            </p>
            <Link href="/employer/verification" className="text-sm font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1">
              Resubmit →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // not_submitted
  return (
    <div className="card bg-orange-50 dark:bg-orange-950 border-orange-100 dark:border-orange-900">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-1">Verification Required</h3>
          <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
            Submit your business registration to start posting jobs.
          </p>
          <Link href="/employer/verification" className="text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1">
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}
