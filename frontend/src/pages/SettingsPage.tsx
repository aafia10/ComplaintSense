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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#23364D]">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Data Operations
          </h1>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Workspace Configuration
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure departments, classification categories, SLA rules, and manage database disaster recovery.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Workspace configuration saved successfully!</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Demo complaint database successfully reset to pristine state.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#0D1B2A] p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-6">
        {/* Profile */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#23364D]">
            Workspace Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Industry Sector
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Workspace Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Categories Manager */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#23364D]">
            Complaint Categories ({categories.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add new category..."
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm min-h-[44px]"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-[#1B324B] hover:bg-slate-900 text-white text-sm font-semibold cursor-pointer min-h-[44px]"
            >
              Add
            </button>
          </div>
        </div>

        {/* Departments Manager */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#23364D]">
            Routing Departments ({departments.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <span
                key={dept}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#13263A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#23364D]"
              >
                <span>{dept}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDepartment(dept)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add new department..."
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm min-h-[44px]"
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              className="px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-[#1B324B] hover:bg-slate-900 text-white text-sm font-semibold cursor-pointer min-h-[44px]"
            >
              Add
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#23364D] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-bold shadow-subtle transition cursor-pointer min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Data Operations Panel */}
      <div className="bg-white dark:bg-[#0D1B2A] p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Data Operations & Disaster Recovery</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Download raw database snapshots, export workspace records, or reset demo state.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* SQLite Backup */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">Download SQLite Backup</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Raw database snapshot of <code className="font-mono text-xs">complaintsense.db</code>.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] hover:bg-slate-100 dark:hover:bg-[#1B324B] text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Backup Database</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">Export Workspace CSV</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                CSV export with all NLP classification labels and sentiment metrics.
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              className="w-full py-2.5 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] hover:bg-slate-100 dark:hover:bg-[#1B324B] text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-bold text-sm text-rose-800 dark:text-rose-300 block">Reset Demo Baseline</span>
              <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-1">
                Restores original multi-industry seed complaints and trains fresh NLP models.
              </p>
            </div>
            <button
              onClick={handleResetDemoData}
              disabled={resetting}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
