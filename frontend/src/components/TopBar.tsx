import React, { useState } from 'react';
import { Plus, RotateCcw, Download, Sparkles, Database, Check } from 'lucide-react';
import { Workspace } from '../api/client';

interface TopBarProps {
  currentTab: string;
  activeWorkspace: Workspace | null;
  onOpenNewComplaint: () => void;
  onResetDemo: () => Promise<void>;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  activeWorkspace,
  onOpenNewComplaint,
  onResetDemo,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard':
      case 'overview':
        return 'Overview';
      case 'complaints':
        return 'Complaints';
      case 'detail':
        return 'Complaint Detail';
      case 'intelligence':
        return 'Intelligence & Discovery';
      case 'knowledge':
        return 'Knowledge Base';
      case 'nlp':
        return 'NLP Lab & Evaluation';
      case 'settings':
        return 'Settings';
      default:
        return 'Workspace';
    }
  };

  const handleResetClick = async () => {
    if (!window.confirm('Reset all demo data back to baseline state? Custom complaints will be reset.')) return;
    try {
      setIsResetting(true);
      await onResetDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to reset demo data');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open('http://localhost:8000/api/data/export-db', '_blank');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Breadcrumb trail */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-normal">Workspace</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 font-medium">{activeWorkspace?.name || 'Loading...'}</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-semibold">{getTabLabel(currentTab)}</span>

        <span className="ml-3 hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          100% Free & Local
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5">
        {/* Reset Demo button */}
        <button
          onClick={handleResetClick}
          disabled={isResetting}
          title="Reset demo complaints to original seed state"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {resetSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Reset Done</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
            </>
          )}
        </button>

        {/* Export DB Backup */}
        <button
          onClick={handleDownloadBackup}
          title="Download SQLite database backup file"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Backup DB</span>
        </button>

        {/* New Complaint Button */}
        <button
          onClick={onOpenNewComplaint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>
    </header>
  );
};
