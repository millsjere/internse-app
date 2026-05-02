'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Spinner } from '@/app/components/ui/Spinner';
import { Avatar } from '@/app/components/ui/Avatar';
import { Badge } from '@/app/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { IUser, IExperience, IEducation } from '@/types';
import toast from 'react-hot-toast';
import {
  Edit2, Save, X, Plus, Trash2, Briefcase, GraduationCap,
  Tag, User, Mail, Phone, FileText, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const emptyExp: Omit<IExperience, '_id'> = { company: '', position: '', startDate: '', endDate: '', currentlyWorking: false, description: '' };
const emptyEdu: Omit<IEducation, '_id'> = { school: '', degree: '', field: '', startDate: '', endDate: '', description: '' };

export default function ProfilePage() {
  const { user, setUser, userType } = useAuthStore();
  const userData = user as IUser | null;

  const [editingBasic, setEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState({ firstname: '', lastname: '', phone: '', bio: '' });
  const [savingBasic, setSavingBasic] = useState(false);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [savingSkills, setSavingSkills] = useState(false);

  const [experiences, setExperiences] = useState<IExperience[]>([]);
  const [expModal, setExpModal] = useState<{ open: boolean; data: Partial<IExperience>; editId: string | null }>({ open: false, data: emptyExp, editId: null });
  const [savingExp, setSavingExp] = useState(false);

  const [educations, setEducations] = useState<IEducation[]>([]);
  const [eduModal, setEduModal] = useState<{ open: boolean; data: Partial<IEducation>; editId: string | null }>({ open: false, data: emptyEdu, editId: null });
  const [savingEdu, setSavingEdu] = useState(false);

  const completion = userData?.profileCompletion ?? 0;

  const init = useCallback(() => {
    if (!userData) return;
    setBasicForm({ firstname: userData.firstname ?? '', lastname: userData.lastname ?? '', phone: userData.phone ?? '', bio: userData.bio ?? '' });
    setSkills(userData.skills ?? []);
    setExperiences(userData.experience ?? []);
    setEducations(userData.education ?? []);
  }, [userData]);

  useEffect(() => { init(); }, [init]);

  async function saveBasic() {
    setSavingBasic(true);
    try {
      const res = await apiClient.updateUserProfile(basicForm);
      if (res.success) {
        toast.success('Profile updated');
        if (res.data) setUser(res.data, 'user');
        setEditingBasic(false);
      } else toast.error(res.message || 'Failed to update');
    } catch { toast.error('Something went wrong'); }
    finally { setSavingBasic(false); }
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) { setSkillInput(''); return; }
    setSkills((prev) => [...prev, s]);
    setSkillInput('');
  }

  async function saveSkills() {
    setSavingSkills(true);
    try {
      const res = await apiClient.updateUserProfile({ skills });
      if (res.success) { toast.success('Skills saved'); if (res.data) setUser(res.data, 'user'); }
      else toast.error(res.message || 'Failed to save skills');
    } catch { toast.error('Something went wrong'); }
    finally { setSavingSkills(false); }
  }

  async function saveExperience() {
    setSavingExp(true);
    try {
      const res = expModal.editId
        ? await apiClient.updateExperience(expModal.editId, expModal.data)
        : await apiClient.addExperience(expModal.data);
      if (res.success) {
        toast.success(expModal.editId ? 'Experience updated' : 'Experience added');
        if (res.data) setUser(res.data, 'user');
        setExpModal({ open: false, data: emptyExp, editId: null });
      } else toast.error(res.message || 'Failed to save');
    } catch { toast.error('Something went wrong'); }
    finally { setSavingExp(false); }
  }

  async function deleteExperience(id: string) {
    if (!confirm('Delete this experience?')) return;
    try {
      const res = await apiClient.deleteExperience(id);
      if (res.success) { toast.success('Deleted'); if (res.data) setUser(res.data, 'user'); }
      else toast.error(res.message || 'Failed to delete');
    } catch { toast.error('Something went wrong'); }
  }

  async function saveEducation() {
    setSavingEdu(true);
    try {
      const res = eduModal.editId
        ? await apiClient.updateEducation(eduModal.editId, eduModal.data)
        : await apiClient.addEducation(eduModal.data);
      if (res.success) {
        toast.success(eduModal.editId ? 'Education updated' : 'Education added');
        if (res.data) setUser(res.data, 'user');
        setEduModal({ open: false, data: emptyEdu, editId: null });
      } else toast.error(res.message || 'Failed to save');
    } catch { toast.error('Something went wrong'); }
    finally { setSavingEdu(false); }
  }

  async function deleteEducation(id: string) {
    if (!confirm('Delete this education?')) return;
    try {
      const res = await apiClient.deleteEducation(id);
      if (res.success) { toast.success('Deleted'); if (res.data) setUser(res.data, 'user'); }
      else toast.error(res.message || 'Failed to delete');
    } catch { toast.error('Something went wrong'); }
  }

  const fullName = `${userData?.firstname ?? ''} ${userData?.lastname ?? ''}`.trim();

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your personal information and career details" />

      {/* Profile completion */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile completion</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{completion}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completion}%` }} />
        </div>
        {completion < 100 && (
          <p className="text-xs text-gray-400 mt-2">Add experience, education, and skills to reach 100%</p>
        )}
      </div>

      <div className="space-y-5">
        {/* Basic info */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Avatar src={userData?.profilePhoto} name={fullName || 'U'} size="lg" />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{fullName || 'Your Name'}</h2>
                <p className="text-sm text-gray-500">{userData?.email}</p>
                {userData?.verified && <Badge variant="green" className="mt-1"><Check className="w-3 h-3" />Verified</Badge>}
              </div>
            </div>
            <button onClick={() => setEditingBasic((v) => !v)} className="btn btn-outline btn-sm">
              {editingBasic ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              {editingBasic ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingBasic ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">First name</label><input className="input" value={basicForm.firstname} onChange={(e) => setBasicForm((p) => ({ ...p, firstname: e.target.value }))} /></div>
                <div><label className="label">Last name</label><input className="input" value={basicForm.lastname} onChange={(e) => setBasicForm((p) => ({ ...p, lastname: e.target.value }))} /></div>
              </div>
              <div><label className="label">Phone</label><input type="tel" className="input" value={basicForm.phone} onChange={(e) => setBasicForm((p) => ({ ...p, phone: e.target.value }))} /></div>
              <div><label className="label">Bio</label><textarea className="input resize-none" rows={3} value={basicForm.bio} onChange={(e) => setBasicForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell employers a bit about yourself..." /></div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => { setEditingBasic(false); init(); }} className="btn btn-ghost">Cancel</button>
                <button onClick={saveBasic} disabled={savingBasic} className="btn btn-primary">
                  {savingBasic ? <Spinner size="sm" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Mail className="w-4 h-4 text-gray-400" />{userData?.email}</div>
              {userData?.phone && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Phone className="w-4 h-4 text-gray-400" />{userData.phone}</div>}
              {userData?.bio && <p className="col-span-2 text-gray-700 dark:text-gray-300 leading-relaxed">{userData.bio}</p>}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /> Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm">
                {s}
                <button onClick={() => setSkills((p) => p.filter((x) => x !== s))} className="hover:text-blue-900 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {skills.length === 0 && <p className="text-sm text-gray-400">No skills added yet</p>}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add a skill (e.g. React, Python)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <button onClick={addSkill} className="btn btn-outline flex-shrink-0"><Plus className="w-4 h-4" /></button>
            <button onClick={saveSkills} disabled={savingSkills} className="btn btn-primary flex-shrink-0">
              {savingSkills ? <Spinner size="sm" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>

        {/* Experience */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400" /> Experience</h2>
            <button onClick={() => setExpModal({ open: true, data: { ...emptyExp }, editId: null })} className="btn btn-outline btn-sm">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {experiences.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No experience added yet</p>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp._id} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{exp.position}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(exp.startDate)} – {exp.currentlyWorking ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : '')}
                        </p>
                        {exp.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exp.description}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setExpModal({ open: true, data: { ...exp }, editId: exp._id! })} className="btn btn-ghost btn-icon"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteExperience(exp._id!)} className="btn btn-danger btn-icon"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><GraduationCap className="w-4 h-4 text-gray-400" /> Education</h2>
            <button onClick={() => setEduModal({ open: true, data: { ...emptyEdu }, editId: null })} className="btn btn-outline btn-sm">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {educations.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No education added yet</p>
          ) : (
            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu._id} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <GraduationCap className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{edu.degree} in {edu.field}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{edu.school}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                        </p>
                        {edu.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{edu.description}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setEduModal({ open: true, data: { ...edu }, editId: edu._id! })} className="btn btn-ghost btn-icon"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteEducation(edu._id!)} className="btn btn-danger btn-icon"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resume */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-gray-400" /> Resume</h2>
          {userData?.resume ? (
            <div className="flex items-center gap-3">
              <a href={userData.resume} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors group">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">View current resume</span>
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No resume uploaded yet</p>
          )}
          <p className="text-xs text-gray-400 mt-3">Upload a new resume to replace the current one (PDF recommended)</p>
        </div>
      </div>

      {/* Experience modal */}
      {expModal.open && (
        <>
          <div className="drawer-overlay animate-fadeIn" onClick={() => setExpModal({ open: false, data: emptyExp, editId: null })} />
          <div className="drawer animate-slideInRight">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <h2 className="font-semibold text-gray-900 dark:text-white">{expModal.editId ? 'Edit Experience' : 'Add Experience'}</h2>
              <button onClick={() => setExpModal({ open: false, data: emptyExp, editId: null })} className="btn btn-ghost btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div><label className="label">Position / Title <span className="text-red-500">*</span></label><input className="input" value={expModal.data.position ?? ''} onChange={(e) => setExpModal((p) => ({ ...p, data: { ...p.data, position: e.target.value } }))} placeholder="e.g. Software Engineer" /></div>
              <div><label className="label">Company <span className="text-red-500">*</span></label><input className="input" value={expModal.data.company ?? ''} onChange={(e) => setExpModal((p) => ({ ...p, data: { ...p.data, company: e.target.value } }))} placeholder="e.g. Acme Corp" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Start Date</label><input type="date" className="input" value={expModal.data.startDate ?? ''} onChange={(e) => setExpModal((p) => ({ ...p, data: { ...p.data, startDate: e.target.value } }))} /></div>
                <div><label className="label">End Date</label><input type="date" className="input" disabled={expModal.data.currentlyWorking} value={expModal.data.endDate ?? ''} onChange={(e) => setExpModal((p) => ({ ...p, data: { ...p.data, endDate: e.target.value } }))} /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="current" checked={expModal.data.currentlyWorking ?? false} onChange={(e) => setExpModal((p) => ({ ...p, data: { ...p.data, currentlyWorking: e.target.checked } }))} className="rounded" />
                <label htmlFor="current" className="text-sm text-gray-700 dark:text-gray-300">I currently work here</label>
              </div>
              <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={expModal.data.description ?? ''} onChange={(e) => setExpModal((p) => ({ ...p, data: { ...p.data, description: e.target.value } }))} placeholder="Brief description of your role..." /></div>
            </div>
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 flex gap-3">
              <button onClick={() => setExpModal({ open: false, data: emptyExp, editId: null })} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={saveExperience} disabled={savingExp} className="btn btn-primary flex-1">
                {savingExp ? <Spinner size="sm" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        </>
      )}

      {/* Education modal */}
      {eduModal.open && (
        <>
          <div className="drawer-overlay animate-fadeIn" onClick={() => setEduModal({ open: false, data: emptyEdu, editId: null })} />
          <div className="drawer animate-slideInRight">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <h2 className="font-semibold text-gray-900 dark:text-white">{eduModal.editId ? 'Edit Education' : 'Add Education'}</h2>
              <button onClick={() => setEduModal({ open: false, data: emptyEdu, editId: null })} className="btn btn-ghost btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div><label className="label">School <span className="text-red-500">*</span></label><input className="input" value={eduModal.data.school ?? ''} onChange={(e) => setEduModal((p) => ({ ...p, data: { ...p.data, school: e.target.value } }))} placeholder="e.g. University of Lagos" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Degree</label><input className="input" value={eduModal.data.degree ?? ''} onChange={(e) => setEduModal((p) => ({ ...p, data: { ...p.data, degree: e.target.value } }))} placeholder="e.g. B.Sc" /></div>
                <div><label className="label">Field of Study</label><input className="input" value={eduModal.data.field ?? ''} onChange={(e) => setEduModal((p) => ({ ...p, data: { ...p.data, field: e.target.value } }))} placeholder="e.g. Computer Science" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Start Date</label><input type="date" className="input" value={eduModal.data.startDate ?? ''} onChange={(e) => setEduModal((p) => ({ ...p, data: { ...p.data, startDate: e.target.value } }))} /></div>
                <div><label className="label">End Date</label><input type="date" className="input" value={eduModal.data.endDate ?? ''} onChange={(e) => setEduModal((p) => ({ ...p, data: { ...p.data, endDate: e.target.value } }))} /></div>
              </div>
              <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={eduModal.data.description ?? ''} onChange={(e) => setEduModal((p) => ({ ...p, data: { ...p.data, description: e.target.value } }))} /></div>
            </div>
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 flex gap-3">
              <button onClick={() => setEduModal({ open: false, data: emptyEdu, editId: null })} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={saveEducation} disabled={savingEdu} className="btn btn-primary flex-1">
                {savingEdu ? <Spinner size="sm" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
