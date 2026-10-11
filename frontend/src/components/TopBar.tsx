import React, { useState } from 'react';
import {
  Menu,
  Plus,
  RotateCcw,
  Download,
  Database,
  Check,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { Workspace } from '../api/client';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  currentTab: string;
  activeWorkspace: Workspace | null;
  onOpenNewComplaint: () => void;
  onResetDemo: () => Promise<void>;
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  activeWorkspace,
  onOpenNewComplaint,
  onResetDemo,
  onOpenMobileMenu,
}) => {
  const { theme, toggleTheme } = useTheme();
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
    <header className="h-16 bg-white dark:bg-[#0D1B2A] border-b border-slate-200 dark:border-[#23364D] px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors">
      {/* Left side: Hamburger button (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2.5 rounded-lg border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1B324B] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Title if sidebar hidden */}
        <div className="flex lg:hidden items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white text-base">ComplaintSense</span>
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden lg:flex items-center gap-2 text-sm">
          <span className="text-slate-400 dark:text-slate-400 font-normal">Workspace</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">{activeWorkspace?.name || 'Loading...'}</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">{getTabLabel(currentTab)}</span>

          <span className="ml-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            100% Free & Local
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#13263A] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1B324B] transition-colors cursor-pointer min-h-[40px] flex items-center gap-1.5 text-xs font-semibold"
          aria-label="Toggle light or dark theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-700" />
              <span className="hidden md:inline">Dark</span>
            </>
          )}
        </button>

        {/* Reset Demo button (Hidden on very small screens, visible on sm+) */}
        <button
          onClick={handleResetClick}
          disabled={isResetting}
          title="Reset demo complaints to original seed state"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#13263A] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1B324B] transition-colors disabled:opacity-50 cursor-pointer min-h-[40px]"
        >
          {resetSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400">Reset Done</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
            </>
          )}
        </button>

        {/* Export DB Backup */}
        <button
          onClick={handleDownloadBackup}
          title="Download SQLite database backup file"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#13263A] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1B324B] transition-colors cursor-pointer min-h-[40px]"
        >
          <Database className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
          <span>Backup DB</span>
        </button>

        {/* New Complaint Button */}
        <button
          onClick={onOpenNewComplaint}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-subtle hover:shadow transition-all cursor-pointer min-h-[40px]"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New Complaint</span>
        </button>
      </div>
    </header>
  );
};
