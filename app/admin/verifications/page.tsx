'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import toast from 'react-hot-toast';
import { Check, X, FileText, ExternalLink, Calendar, Building2, CheckCircle2 } from 'lucide-react';

interface PendingVerification {
  _id: string;
  companyName: string;
  email: string;
  businessVerification: {
    registrationDocument?: string;
    registrationNumber?: string;
    submittedAt?: string;
  };
  createdAt: string;
}

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  async function fetchPendingVerifications() {
    try {
      const res = await adminApi.getPendingVerifications();
      if (res.success) {
        setVerifications(res.data);
      }
    } catch (err) {
      toast.error('Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(companyId: string) {
    setProcessing(companyId);
    try {
      const res = await adminApi.approveCompanyVerification(companyId, adminNotes);
      if (res.success) {
        toast.success('Company approved!');
        setVerifications(verifications.filter((v) => v._id !== companyId));
        setAdminNotes('');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(companyId: string) {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(companyId);
    try {
      const res = await adminApi.rejectCompanyVerification(companyId, rejectionReason, adminNotes);
      if (res.success) {
        toast.success('Company rejected');
        setVerifications(verifications.filter((v) => v._id !== companyId));
        setRejectionReason('');
        setAdminNotes('');
        setSelectedId(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  }

  function toggleSelectId(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedIds.size === verifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(verifications.map((v) => v._id)));
    }
  }

  async function handleBulkApprove() {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one company');
      return;
    }

    setBulkProcessing(true);
    let approved = 0;
    let failed = 0;

    for (const id of selectedIds) {
      try {
        await adminApi.approveCompanyVerification(id, adminNotes);
        approved++;
      } catch {
        failed++;
      }
    }

    setBulkProcessing(false);
    toast.success(`Approved ${approved} company/companies${failed > 0 ? ` (${failed} failed)` : ''}`);
    setVerifications(verifications.filter((v) => !selectedIds.has(v._id)));
    setSelectedIds(new Set());
    setBulkAction(null);
    setAdminNotes('');
  }

  async function handleBulkReject() {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one company');
      return;
    }
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setBulkProcessing(true);
    let rejected = 0;
    let failed = 0;

    for (const id of selectedIds) {
      try {
        await adminApi.rejectCompanyVerification(id, rejectionReason, adminNotes);
        rejected++;
      } catch {
        failed++;
      }
    }

    setBulkProcessing(false);
    toast.success(`Rejected ${rejected} company/companies${failed > 0 ? ` (${failed} failed)` : ''}`);
    setVerifications(verifications.filter((v) => !selectedIds.has(v._id)));
    setSelectedIds(new Set());
    setBulkAction(null);
    setRejectionReason('');
    setAdminNotes('');
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
      <PageHeader
        title="Business Verifications"
        description={`${verifications.length} pending verification${verifications.length !== 1 ? 's' : ''}`}
      />

      {verifications.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Caught Up!</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">No pending verifications at this time.</p>
        </div>
      ) : (
        <>
          {/* Bulk Actions Toolbar */}
          {selectedIds.size > 0 && (
            <div className="card bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === verifications.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedIds.size} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  {bulkAction === 'approve' ? (
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkProcessing}
                      className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                    >
                      {bulkProcessing ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
                      Approve All
                    </button>
                  ) : (
                    <button
                      onClick={() => setBulkAction('approve')}
                      className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  {bulkAction === 'reject' ? (
                    <button
                      onClick={handleBulkReject}
                      disabled={bulkProcessing || !rejectionReason.trim()}
                      className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                      {bulkProcessing ? <Spinner size="sm" /> : <X className="w-4 h-4" />}
                      Reject All
                    </button>
                  ) : (
                    <button
                      onClick={() => setBulkAction('reject')}
                      className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setBulkAction(null);
                      setRejectionReason('');
                      setAdminNotes('');
                    }}
                    className="btn btn-sm btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Bulk Reject Form */}
              {bulkAction === 'reject' && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 space-y-3">
                  <div>
                    <label className="label text-sm">Rejection Reason <span className="text-red-500">*</span></label>
                    <textarea
                      className="input resize-none"
                      rows={2}
                      placeholder="Reason to send to all companies..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label text-sm">Admin Notes (Optional)</label>
                    <textarea
                      className="input resize-none"
                      rows={1}
                      placeholder="Internal notes..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Bulk Approve Notes */}
              {bulkAction === 'approve' && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <label className="label text-sm">Admin Notes (Optional)</label>
                  <textarea
                    className="input resize-none"
                    rows={1}
                    placeholder="Internal notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Verification List */}
          <div className="space-y-4">
          {verifications.map((verification) => (
            <div key={verification._id} className={`card ${selectedIds.has(verification._id) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                {/* Checkbox & Company Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(verification._id)}
                    onChange={() => toggleSelectId(verification._id)}
                    className="w-4 h-4 rounded mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {verification.companyName}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{verification.email}</p>

                  {/* Registration Details */}
                  <div className="space-y-2 text-sm mb-4">
                    {verification.businessVerification.registrationNumber && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Reg Number:</span>
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          {verification.businessVerification.registrationNumber}
                        </code>
                      </div>
                    )}
                    {verification.businessVerification.submittedAt && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted {new Date(verification.businessVerification.submittedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Document Link */}
                  {verification.businessVerification.registrationDocument && (
                    <a
                      href={verification.businessVerification.registrationDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
                    >
                      <FileText className="w-4 h-4" />
                      View Registration Document
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(verification._id)}
                    disabled={processing === verification._id}
                    className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  >
                    {processing === verification._id ? (
                      <Spinner size="sm" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedId(selectedId === verification._id ? null : verification._id)}
                    className="btn btn-sm btn-outline"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Rejection Form */}
              {selectedId === verification._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div>
                    <label className="label text-sm">Rejection Reason <span className="text-red-500">*</span></label>
                    <textarea
                      className="input resize-none"
                      rows={2}
                      placeholder="e.g., Document is unclear, Invalid registration number, Missing information"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label text-sm">Admin Notes (Optional)</label>
                    <textarea
                      className="input resize-none"
                      rows={2}
                      placeholder="Additional context for the company..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setSelectedId(null)}
                      className="btn btn-sm btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(verification._id)}
                      disabled={processing === verification._id || !rejectionReason.trim()}
                      className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                      {processing === verification._id ? (
                        <Spinner size="sm" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
