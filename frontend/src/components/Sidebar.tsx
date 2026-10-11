import React from 'react';
import {
  LayoutDashboard,
  MessageSquareWarning,
  BrainCircuit,
  BookOpen,
  FlaskConical,
  Settings,
  Building2,
  ChevronDown,
  Sparkles,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { Workspace } from '../api/client';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenDemoModal: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenDemoModal,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'nlp', label: 'NLP Lab', icon: FlaskConical },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId === 'overview' ? 'dashboard' : tabId);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-[#23364D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0F2A5F] dark:bg-blue-600 flex items-center justify-center text-white shadow-subtle shrink-0">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">ComplaintSense</span>
                <span className="text-[11px] font-bold uppercase bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-700/50">
                  SaaS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">Complaint Intelligence</p>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#13263A] transition cursor-pointer"
              aria-label="Close sidebar menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Platform Hubs
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'overview' && currentTab === 'dashboard');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-[#13263A] text-blue-900 dark:text-blue-300 font-bold border border-blue-200/70 dark:border-blue-500/30 shadow-subtle'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#13263A]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Workspace Switcher Card */}
      <div className="p-3 border-t border-slate-200 dark:border-[#23364D]">
        <div className="p-3 bg-slate-50 dark:bg-[#13263A] rounded-xl border border-slate-200 dark:border-[#23364D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Workspace</span>
            <button
              onClick={() => {
                onOpenDemoModal();
                if (onMobileClose) onMobileClose();
              }}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 hover:underline cursor-pointer"
              title="Switch demo workspace"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Switch</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/60 flex items-center justify-center text-blue-900 dark:text-blue-200 font-bold text-xs shrink-0">
              {activeWorkspace?.name?.substring(0, 2).toUpperCase() || 'WS'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{activeWorkspace?.name || 'Loading...'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activeWorkspace?.industry || 'Customer Support'}</p>
            </div>
          </div>

          {/* Quick Dropdown selector */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-[#23364D]">
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">Quick Switch</label>
            <select
              value={activeWorkspace?.id || ''}
              onChange={(e) => {
                const target = workspaces.find((w) => w.id === e.target.value);
                if (target) {
                  onSelectWorkspace(target);
                  if (onMobileClose) onMobileClose();
                }
              }}
              className="w-full bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer min-h-[38px]"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.industry})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#0D1B2A] border-r border-slate-200 dark:border-[#23364D] flex-col justify-between shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer (< 1024px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#0D1B2A] shadow-modal border-r border-slate-200 dark:border-[#23364D] z-10 transition-transform duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
