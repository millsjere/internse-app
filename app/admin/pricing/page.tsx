'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Star } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { code: 'USD', symbol: '$',  label: 'USD — US Dollar' },
  { code: 'GBP', symbol: '£',  label: 'GBP — British Pound' },
  { code: 'EUR', symbol: '€',  label: 'EUR — Euro' },
  { code: 'GHS', symbol: '₵',  label: 'GHS — Ghana Cedi' },
  { code: 'NGN', symbol: '₦',  label: 'NGN — Nigerian Naira' },
  { code: 'KES', symbol: 'KSh',label: 'KES — Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R',  label: 'ZAR — South African Rand' },
];

const EMPTY_PLAN = {
  _id: '',
  planType: '',
  displayName: '',
  currency: 'USD',
  monthlyPrice: 0,
  annualPrice: 0,
  credits: 5,
  resetsMonthly: true,
  teamSeats: 1,
  featuredListings: 0,
  isPopular: false,
  order: 0,
  features: [] as string[],
};

type PlanDraft = typeof EMPTY_PLAN;

export default function PricingPage() {
  const [plans, setPlans] = useState<PlanDraft[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newPlan, setNewPlan] = useState<PlanDraft>({ ...EMPTY_PLAN });

  useEffect(() => {
    adminApi.getPlanConfigs()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setPlans(list.map((p: any) => ({
          _id: p._id,
          planType: p.planType,
          displayName: p.displayName,
          currency: p.currency ?? 'USD',
          monthlyPrice: p.monthlyPrice,
          annualPrice: p.annualPrice,
          credits: p.credits,
          resetsMonthly: p.resetsMonthly,
          teamSeats: p.teamSeats,
          featuredListings: p.featuredListings,
          isPopular: p.isPopular ?? false,
          order: p.order ?? 0,
          features: p.features ?? [],
        })));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function updatePlan(id: string, field: string, value: any) {
    setPlans(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
  }
  function addFeature(id: string) {
    setPlans(prev => prev.map(p => p._id === id ? { ...p, features: [...p.features, ''] } : p));
  }
  function updateFeature(id: string, idx: number, value: string) {
    setPlans(prev => prev.map(p => {
      if (p._id !== id) return p;
      const features = [...p.features]; features[idx] = value; return { ...p, features };
    }));
  }
  function removeFeature(id: string, idx: number) {
    setPlans(prev => prev.map(p => p._id !== id ? p : { ...p, features: p.features.filter((_, i) => i !== idx) }));
  }

  async function savePlan(plan: PlanDraft) {
    setSaving(s => ({ ...s, [plan._id]: true }));
    try {
      await adminApi.updatePlanConfig(plan._id, plan);
      toast.success(`${plan.displayName} saved`);
    } catch { toast.error('Save failed'); }
    finally { setSaving(s => ({ ...s, [plan._id]: false })); }
  }

  async function deletePlan(plan: PlanDraft) {
    if (!confirm(`Delete "${plan.displayName}"?`)) return;
    setDeleting(s => ({ ...s, [plan._id]: true }));
    try {
      await adminApi.deletePlanConfig(plan._id);
      setPlans(prev => prev.filter(p => p._id !== plan._id));
      toast.success('Plan deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(s => ({ ...s, [plan._id]: false })); }
  }

  async function createPlan() {
    if (!newPlan.planType.trim() || !newPlan.displayName.trim()) {
      toast.error('Plan type and display name are required');
      return;
    }
    try {
      const res = await adminApi.createPlanConfig(newPlan);
      const created = res.data;
      setPlans(prev => [...prev, {
        _id: created._id, planType: created.planType, displayName: created.displayName,
        currency: created.currency ?? 'USD', monthlyPrice: created.monthlyPrice,
        annualPrice: created.annualPrice, credits: created.credits,
        resetsMonthly: created.resetsMonthly, teamSeats: created.teamSeats,
        featuredListings: created.featuredListings, isPopular: created.isPopular ?? false,
        order: created.order ?? 0, features: created.features ?? [],
      }]);
      setNewPlan({ ...EMPTY_PLAN });
      setShowNew(false);
      toast.success(`${created.displayName} plan created`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Create failed');
    }
  }

  if (!loaded) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Plans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage plans shown on marketing pages. Changes take effect immediately.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            saving={saving[plan._id]}
            deleting={deleting[plan._id]}
            onChange={(field, val) => updatePlan(plan._id, field, val)}
            onAddFeature={() => addFeature(plan._id)}
            onUpdateFeature={(i, v) => updateFeature(plan._id, i, v)}
            onRemoveFeature={(i) => removeFeature(plan._id, i)}
            onSave={() => savePlan(plan)}
            onDelete={() => deletePlan(plan)}
          />
        ))}

        {/* New plan form */}
        {showNew && (
          <PlanCard
            plan={newPlan}
            saving={false}
            isNew
            onChange={(field, val) => setNewPlan(p => ({ ...p, [field]: val }))}
            onAddFeature={() => setNewPlan(p => ({ ...p, features: [...p.features, ''] }))}
            onUpdateFeature={(i, v) => setNewPlan(p => { const f = [...p.features]; f[i] = v; return { ...p, features: f }; })}
            onRemoveFeature={(i) => setNewPlan(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))}
            onSave={createPlan}
            onDelete={() => setShowNew(false)}
          />
        )}
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: PlanDraft;
  saving?: boolean;
  deleting?: boolean;
  isNew?: boolean;
  onChange: (field: string, val: any) => void;
  onAddFeature: () => void;
  onUpdateFeature: (i: number, v: string) => void;
  onRemoveFeature: (i: number) => void;
  onSave: () => void;
  onDelete: () => void;
}

function PlanCard({ plan, saving, deleting, isNew, onChange, onAddFeature, onUpdateFeature, onRemoveFeature, onSave, onDelete }: PlanCardProps) {
  const currencySymbol = CURRENCIES.find(c => c.code === plan.currency)?.symbol ?? plan.currency;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border-2 flex flex-col gap-4 p-6 ${plan.isPopular ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'}`}>
      {/* Header row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={plan.displayName}
          onChange={(e) => onChange('displayName', e.target.value)}
          placeholder="Plan name"
          className="flex-1 text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => onChange('isPopular', !plan.isPopular)}
          title="Mark as popular"
          className={`p-1.5 rounded-lg transition-colors ${plan.isPopular ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-500'}`}
        >
          <Star className="w-4 h-4" fill={plan.isPopular ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          title={isNew ? 'Cancel' : 'Delete plan'}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isNew && (
        <Field label="Plan ID (unique key)" value={plan.planType} onChange={(v) => onChange('planType', v)} placeholder="e.g. starter" />
      )}

      {/* Currency */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Currency</label>
        <select
          value={plan.currency}
          onChange={(e) => onChange('currency', e.target.value)}
          className="w-full px-3 py-1.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
        >
          {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Monthly (${currencySymbol})`} value={plan.monthlyPrice} onChange={(v) => onChange('monthlyPrice', Number(v))} type="number" />
        <Field label={`Annual (${currencySymbol})`} value={plan.annualPrice} onChange={(v) => onChange('annualPrice', Number(v))} type="number" />
        <Field label="Credits" value={plan.credits} onChange={(v) => onChange('credits', Number(v))} type="number" />
        <Field label="Team Seats" value={plan.teamSeats} onChange={(v) => onChange('teamSeats', Number(v))} type="number" />
        <Field label="Featured Listings" value={plan.featuredListings} onChange={(v) => onChange('featuredListings', Number(v))} type="number" />
        <Field label="Display Order" value={plan.order} onChange={(v) => onChange('order', Number(v))} type="number" />
      </div>

      {/* Resets monthly toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Credits reset monthly</span>
        <button
          type="button"
          onClick={() => onChange('resetsMonthly', !plan.resetsMonthly)}
          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${plan.resetsMonthly ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${plan.resetsMonthly ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Features</p>
          <button onClick={onAddFeature} className="p-1 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-1.5">
          {plan.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={f}
                onChange={(e) => onUpdateFeature(i, e.target.value)}
                placeholder="Feature description"
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button onClick={() => onRemoveFeature(i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 font-semibold text-sm transition-colors"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : isNew ? 'Create Plan' : 'Save Changes'}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-1.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
