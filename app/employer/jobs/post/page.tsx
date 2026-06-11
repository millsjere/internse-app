'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Globe, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { JOB_INDUSTRIES } from '@/lib/constants';

interface JobQuestion {
  question: string;
  required: boolean;
}

interface JobForm {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  tags: string;
  industry: string;
  jobType: string;
  category: string;
  level: string;
  location: string;
  remote: boolean;
  salaryMin: string;
  salaryMax: string;
  currency: string;
}

const defaultForm: JobForm = {
  title: '', description: '', requirements: '', responsibilities: '',
  benefits: '', tags: '', industry: '',
  jobType: 'full-time', category: 'internship', level: 'entry', location: '',
  remote: false, salaryMin: '', salaryMax: '', currency: 'USD',
};

const industries = JOB_INDUSTRIES;

export default function PostJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [form, setForm] = useState<JobForm>(defaultForm);
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [jobStatus, setJobStatus] = useState<string>('drafted');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await apiClient.getCompanyJobs();
        if (res.success && Array.isArray(res.data)) {
          const job = res.data.find((j: any) => j._id === editId);
          if (job) {
            setJobStatus(job.status ?? 'drafted');
            setForm({
              title: job.title ?? '',
              description: job.description ?? '',
              requirements: (job.requirements ?? []).join('\n'),
              responsibilities: (job.responsibilities ?? []).join('\n'),
              benefits: (job.benefits ?? []).join('\n'),
              tags: (job.tags ?? []).join(', '),
              industry: job.industry ?? '',
              jobType: job.jobType ?? 'full-time',
              category: job.category ?? 'internship',
              level: job.level ?? 'entry',
              location: job.location ?? '',
              remote: job.remote ?? false,
              salaryMin: job.salary?.min?.toString() ?? '',
              salaryMax: job.salary?.max?.toString() ?? '',
              currency: job.salary?.currency ?? 'USD',
            });
            setQuestions(
              (job.questions ?? []).map((q: any) => ({
                question: q.question ?? '',
                required: q.required ?? false,
              }))
            );
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [editId]);

  function set(field: keyof JobForm, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function splitLines(val: string) {
    return val.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  function buildPayload() {
    return {
      title: form.title,
      description: form.description,
      requirements: splitLines(form.requirements),
      responsibilities: splitLines(form.responsibilities),
      benefits: splitLines(form.benefits),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      industry: form.industry,
      jobType: form.jobType,
      category: form.category,
      level: form.level,
      location: form.location,
      remote: form.remote,
      salary: {
        min: form.salaryMin ? Number(form.salaryMin) : undefined,
        max: form.salaryMax ? Number(form.salaryMax) : undefined,
        currency: form.currency,
      },
      questions: questions.filter((q) => q.question.trim()),
    };
  }

  async function handleSaveDraft() {
    if (!form.title || !form.description) {
      toast.error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      const res = isEditing
        ? await apiClient.updateJob(editId!, payload)
        : await apiClient.createJob(payload);
      if (res.success) {
        toast.success(isEditing ? 'Job updated' : 'Draft saved');
        router.push('/employer/jobs');
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!form.title || !form.description || !form.industry) {
      toast.error('Title, description, and industry are required to publish');
      return;
    }
    setPublishing(true);
    try {
      const payload = buildPayload();
      let jobId = editId;

      if (!isEditing) {
        const createRes = await apiClient.createJob(payload);
        if (!createRes.success) { toast.error(createRes.message || 'Failed to create'); return; }
        jobId = createRes.data?._id;
      } else {
        const updateRes = await apiClient.updateJob(editId!, payload);
        if (!updateRes.success) { toast.error(updateRes.message || 'Failed to update'); return; }
      }

      // If already published, the update is sufficient — no need to re-publish
      if (jobStatus === 'published') {
        toast.success('Job updated');
        router.push('/employer/jobs');
        return;
      }

      if (jobId) {
        const pubRes = await apiClient.publishJob(jobId);
        if (pubRes.success) {
          toast.success('Job published!');
          router.push('/employer/jobs');
        } else {
          toast.error(pubRes.message || 'Failed to publish');
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setPublishing(false);
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
        <Link href="/employer/jobs" className="btn btn-ghost btn-sm -ml-2 mb-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
        <PageHeader
          title={isEditing ? 'Edit Job' : 'Post a Job'}
          description={isEditing ? 'Update your job details below.' : 'Fill in the details to attract the right candidates.'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic info */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Job Title <span className="text-red-500">*</span></label>
                <input className="input" placeholder="e.g. Frontend Developer Intern" value={form.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div>
                <label className="label">Description <span className="text-red-500">*</span></label>
                <textarea className="input resize-none" rows={6} placeholder="Describe the role, responsibilities, and what you're looking for..." value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div>
                <label className="label">Requirements</label>
                <textarea className="input resize-none" rows={4} placeholder="One requirement per line&#10;e.g. 2+ years of React experience&#10;Strong communication skills" value={form.requirements} onChange={(e) => set('requirements', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">One item per line</p>
              </div>
              <div>
                <label className="label">Responsibilities</label>
                <textarea className="input resize-none" rows={4} placeholder="One responsibility per line&#10;e.g. Build and ship new features&#10;Collaborate with designers and backend engineers" value={form.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">One item per line — shown as a numbered list on the job page</p>
              </div>
              <div>
                <label className="label">Benefits & Perks</label>
                <textarea className="input resize-none" rows={3} placeholder="One benefit per line&#10;e.g. Competitive salary&#10;Remote-friendly&#10;Learning budget" value={form.benefits} onChange={(e) => set('benefits', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">One item per line</p>
              </div>
              <div>
                <label className="label">Skills / Tags</label>
                <input className="input" placeholder="e.g. React, TypeScript, Node.js" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Comma-separated — helps candidates find the role</p>
              </div>
            </div>
          </div>

          {/* Role details */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Role Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Industry <span className="text-red-500">*</span></label>
                <select className="input" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                  <option value="">Select industry</option>
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Job Type</label>
                <select className="input" value={form.jobType} onChange={(e) => set('jobType', e.target.value)}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="internship">Internship</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="fellowship">Fellowship</option>
                </select>
              </div>
              <div>
                <label className="label">Experience Level</label>
                <select className="input" value={form.level} onChange={(e) => set('level', e.target.value)}>
                  <option value="entry">Entry level</option>
                  <option value="mid">Mid level</option>
                  <option value="senior">Senior level</option>
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="e.g. New York, NY" value={form.location} onChange={(e) => set('location', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.remote}
                  onChange={(e) => set('remote', e.target.checked)}
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Remote position</p>
                <p className="text-xs text-gray-500">This job can be done from anywhere</p>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Compensation <span className="text-xs font-normal text-gray-400">(optional)</span></h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Currency</label>
                <select className="input" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
              <div>
                <label className="label">Min Salary</label>
                <input type="number" className="input" placeholder="50,000" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
              </div>
              <div>
                <label className="label">Max Salary</label>
                <input type="number" className="input" placeholder="80,000" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Screening questions */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Screening Questions</h2>
                <p className="text-xs text-gray-400 mt-0.5">Candidates must answer these when applying.</p>
              </div>
              <button
                type="button"
                onClick={() => setQuestions((prev) => [...prev, { question: '', required: false }])}
                className="btn btn-outline btn-sm"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>
            {questions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No screening questions added.</p>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex-1">
                      <input
                        className="input text-sm"
                        placeholder={`Question ${idx + 1}`}
                        value={q.question}
                        onChange={(e) =>
                          setQuestions((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, question: e.target.value } : item))
                          )
                        }
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap pt-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) =>
                          setQuestions((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, required: e.target.checked } : item))
                          )
                        }
                        className="w-3.5 h-3.5"
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 pt-2.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              {jobStatus === 'published' ? 'Update Job' : 'Publish'}
            </h2>
            <div className="space-y-3">
              <button onClick={handlePublish} disabled={publishing || saving} className="btn btn-primary w-full">
                {publishing ? <Spinner size="sm" /> : jobStatus === 'published' ? <Save className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                {jobStatus === 'published' ? 'Save Changes' : isEditing ? 'Save & Publish' : 'Publish Job'}
              </button>
              {jobStatus !== 'published' && (
                <button onClick={handleSaveDraft} disabled={saving || publishing} className="btn btn-outline w-full">
                  {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                  Save as Draft
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {jobStatus === 'published'
                ? 'Changes will be applied immediately to the live listing.'
                : 'Drafts are only visible to you. Publish to make the job visible to candidates.'}
            </p>
          </div>

          <div className="card bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Tips for a great posting</p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5 list-disc list-inside">
              <li>Be specific about the role and responsibilities</li>
              <li>List must-have vs. nice-to-have skills separately</li>
              <li>Include salary range to attract more applicants</li>
              <li>Mention growth opportunities and benefits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
