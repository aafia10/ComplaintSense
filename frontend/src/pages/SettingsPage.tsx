import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Building2,
  Plus,
  X,
  Database,
  Download,
  RotateCcw,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { fetchApi, Workspace } from '../api/client';

interface SettingsPageProps {
  activeWorkspace: Workspace;
  onWorkspaceUpdated: (updated: Workspace) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  activeWorkspace,
  onWorkspaceUpdated,
}) => {
  const [name, setName] = useState(activeWorkspace.name);
  const [industry, setIndustry] = useState(activeWorkspace.industry);
  const [description, setDescription] = useState(activeWorkspace.description || '');
  const [categories, setCategories] = useState<string[]>([...activeWorkspace.categories]);
  const [departments, setDepartments] = useState<string[]>([...activeWorkspace.departments]);
  const [newCat, setNewCat] = useState('');
  const [newDept, setNewDept] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Data management state
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleAddCategory = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      setCategories([...categories, newCat.trim()]);
      setNewCat('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleAddDepartment = () => {
    if (newDept.trim() && !departments.includes(newDept.trim())) {
      setDepartments([...departments, newDept.trim()]);
      setNewDept('');
    }
  };

  const handleRemoveDepartment = (dept: string) => {
    setDepartments(departments.filter((d) => d !== dept));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccess(false);
      const res = await fetchApi<Workspace>(`/workspaces/${activeWorkspace.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          industry: industry.trim(),
          description: description.trim(),
          categories,
          departments,
        }),
      });

      onWorkspaceUpdated(res);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Are you sure you want to reset all demo complaints back to original seed data?')) return;
    try {
      setResetting(true);
      await fetchApi('/data/reset-demo', { method: 'POST' });
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset demo data');
    } finally {
      setResetting(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open('http://localhost:8000/api/data/export-db', '_blank');
  };

  const handleExportCsv = () => {
    window.open(`http://localhost:8000/api/data/export-csv?workspace_id=${activeWorkspace.id}`, '_blank');
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Settings & Data Management
          </h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            Workspace Configuration
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Configure workspace departments, classification categories, urgency rules, and manage database backups.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Workspace configuration saved successfully!</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo complaint database successfully reset to pristine state.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
        {/* Profile */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Workspace Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company / Workspace Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Industry Domain</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Departments */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Operational Departments</h2>
          <p className="text-xs text-slate-400">
            Departments eligible for automated routing recommendations and escalation workflows.
          </p>

          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <span
                key={dept}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
              >
                <span>{dept}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDepartment(dept)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Add new department..."
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Complaint Categories */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Recognized Complaint Categories</h2>
          <p className="text-xs text-slate-400">
            Categories recognized by the issue classifier for this workspace.
          </p>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-emerald-500 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Add new category..."
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* DATA MANAGEMENT & BACKUP SECTION */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>Data Operations & Local Storage Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export database backups, generate full CSV archives, or reset demo complaints to pristine state.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export DB Backup */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-semibold text-xs text-slate-900 block">SQLite Database Backup</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download a complete, offline snapshot copy of <code className="text-emerald-800">complaintsense.db</code>.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .db File</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-semibold text-xs text-slate-900 block">Export Full CSV</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Export all tickets with NLP classifications, sentiment scores, and urgency tiers.
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .csv Archive</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200/80 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-semibold text-xs text-rose-900 block">Reset Demo Baseline</span>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Restores all 176 complaints and signature clusters back to baseline state.
              </p>
            </div>
            <button
              onClick={handleResetDemoData}
              disabled={resetting}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
