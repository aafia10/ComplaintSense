import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Building2, Plus, X } from 'lucide-react';
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Company Configuration
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Customize workspace parameters, operational departments, and classification categories.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Workspace configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Company Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Operational Departments */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Configured Departments
          </h3>
          <p className="text-xs text-slate-400">
            Departments eligible for routing recommendations and escalation workflows.
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
                  className="text-slate-400 hover:text-rose-600"
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
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Complaint Categories */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Complaint Categories
          </h3>
          <p className="text-xs text-slate-400">
            Categories recognized by the issue classifier for this workspace.
          </p>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span 
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-indigo-400 hover:text-rose-600"
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
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
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
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
