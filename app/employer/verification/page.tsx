'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Clock, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';

interface VerificationStatus {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  canPostJobs: boolean;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
  adminNotes?: string;
}

export default function VerificationPage() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  async function fetchVerificationStatus() {
    try {
      const res = await apiClient.getVerificationStatus();
      if (res.success) {
        setStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch verification status:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocumentFile(file);
    }
    e.target.value = '';
  }

  async function handleSubmitVerification() {
    if (!registrationNumber.trim()) {
      toast.error('Please enter registration number');
      return;
    }
    if (!documentFile) {
      toast.error('Please select a document');
      return;
    }

    setSubmitting(true);
    try {
      const uploadRes = await apiClient.uploadBusinessDocument(documentFile);
      if (!uploadRes.success) {
        toast.error(uploadRes.message || 'Failed to upload document');
        return;
      }

      const submitRes = await apiClient.submitBusinessVerification(registrationNumber, uploadRes.data.documentUrl);
      if (submitRes.success) {
        toast.success('Verification submitted! Awaiting admin review.');
        setStatus(submitRes.data);
        setRegistrationNumber('');
        setDocumentFile(null);
      } else {
        toast.error(submitRes.message || 'Failed to submit verification');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/employer" className="btn btn-ghost btn-sm -ml-2 mb-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <PageHeader
          title="Business Verification"
          description="Submit your business registration documents to start posting jobs."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status Card */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div>
                {status?.status === 'not_submitted' && (
                  <>
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                  </>
                )}
                {status?.status === 'pending' && (
                  <>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </>
                )}
                {status?.status === 'approved' && (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </>
                )}
                {status?.status === 'rejected' && (
                  <>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  {status?.status === 'not_submitted' && 'Verification Not Started'}
                  {status?.status === 'pending' && 'Verification Pending'}
                  {status?.status === 'approved' && 'Verified ✓'}
                  {status?.status === 'rejected' && 'Verification Rejected'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {status?.status === 'not_submitted' && 'Please submit your business registration to enable job posting.'}
                  {status?.status === 'pending' && 'Your submission is under review. This typically takes 24-48 hours.'}
                  {status?.status === 'approved' && 'Your company is verified and approved to post jobs!'}
                  {status?.status === 'rejected' && `Your verification was rejected: ${status?.rejectionReason}`}
                </p>
                {status?.submittedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Submitted: {new Date(status.submittedAt).toLocaleDateString()}
                  </p>
                )}
                {status?.verifiedAt && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    Verified: {new Date(status.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submission Form */}
          {(status?.status === 'not_submitted' || status?.status === 'rejected') && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Submit Verification</h2>
              <div className="space-y-5">
                {/* Registration Number */}
                <div>
                  <label className="label">Registration Number <span className="text-red-500">*</span></label>
                  <input
                    className="input"
                    placeholder="e.g., RC-12345 or ABN-123456789"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter your business registration, corporate number, or tax ID</p>
                </div>

                {/* Document Upload */}
                <div>
                  <label className="label">Business Registration Certificate <span className="text-red-500">*</span></label>
                  <input
                    id="doc-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {documentFile ? (
                    <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{documentFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocumentFile(null)}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="doc-upload" className="cursor-pointer block">
                      <div className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload PDF</span>
                          <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitVerification}
                  disabled={submitting || !registrationNumber.trim() || !documentFile}
                  className="btn btn-primary w-full"
                >
                  {submitting ? <Spinner size="sm" /> : <Upload className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </div>
          )}

          {status?.status === 'pending' && (
            <div className="card bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">⏳ Under Review</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your business verification is being reviewed by our admin team. You&apos;ll receive an email notification once the review is complete.
              </p>
            </div>
          )}

          {status?.status === 'approved' && (
            <div className="card bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900">
              <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium mb-2">✓ Verified</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                Your company is verified and ready to post jobs!
              </p>
              <Link href="/employer/jobs/post" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
                Post Your First Job →
              </Link>
            </div>
          )}

          {status?.status === 'rejected' && (
            <div className="card bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">⚠ Verification Rejected</p>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                {status?.rejectionReason || 'Your verification was rejected. Please review the requirements and resubmit.'}
              </p>
              {status?.adminNotes && (
                <div className="p-2 rounded bg-red-100 dark:bg-red-900/50 mb-3">
                  <p className="text-xs text-red-800 dark:text-red-300 font-medium">Admin Notes:</p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">{status.adminNotes}</p>
                </div>
              )}
              <p className="text-xs text-red-600 dark:text-red-400">
                You can update your documents and resubmit above.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">📋 What We Need</p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-2">
              <li>✓ Valid business registration document</li>
              <li>✓ Clear company name and number</li>
              <li>✓ Company address (if visible)</li>
              <li>✓ PDF format (Max 5MB)</li>
            </ul>
          </div>

          <div className="card bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-3">⏱️ Review Time</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Typically reviewed within 24-48 hours. Incomplete documents may require resubmission.
            </p>
          </div>

          <div className="card">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">❓ Questions?</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Contact our support team for assistance with verification.
            </p>
            <a href="mailto:support@internse.com" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              support@internse.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
