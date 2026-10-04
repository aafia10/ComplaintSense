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
  ArrowRightLeft
} from 'lucide-react';
import { Workspace } from '../api/client';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenDemoModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenDemoModal,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'nlp', label: 'NLP Lab', icon: FlaskConical },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-base tracking-tight">ComplaintSense</span>
              <span className="text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/60">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">Complaint Intelligence</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'overview' && currentTab === 'dashboard');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id === 'overview' ? 'dashboard' : item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Workspace Switcher Card */}
      <div className="p-3 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Workspace</span>
            <button
              onClick={onOpenDemoModal}
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
              title="Switch demo workspace"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Switch</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 border border-emerald-200/60 flex items-center justify-center text-emerald-800 font-semibold text-xs shrink-0">
              {activeWorkspace?.name?.substring(0, 2).toUpperCase() || 'WS'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">{activeWorkspace?.name || 'Loading...'}</p>
              <p className="text-[11px] text-slate-500 truncate">{activeWorkspace?.industry || 'Customer Support'}</p>
            </div>
          </div>

          {/* Quick Dropdown selector */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Quick Switch</label>
            <select
              value={activeWorkspace?.id || ''}
              onChange={(e) => {
                const target = workspaces.find((w) => w.id === e.target.value);
                if (target) onSelectWorkspace(target);
              }}
              className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
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
    </aside>
  );
};
