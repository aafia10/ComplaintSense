import React from 'react';
import { 
  BrainCircuit, 
  BarChart3, 
  Layers, 
  Cpu, 
  BookOpen, 
  Settings, 
  Plus, 
  ChevronDown, 
  Sparkles, 
  Activity,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Workspace } from '../api/client';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenDemoModal: () => void;
  onOpenNewComplaint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenDemoModal,
  onOpenNewComplaint,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'complaints', label: 'Complaints', icon: Layers },
    { id: 'intelligence', label: 'Intelligence', icon: Activity },
    { id: 'nlp', label: 'NLP Lab', icon: Cpu },
    { id: 'evaluation', label: 'Model Evaluation', icon: BrainCircuit },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setCurrentTab('landing')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-gray-950 flex items-center gap-1.5">
                  ComplaintSense
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    SaaS
                  </span>
                </span>
                <span className="text-[11px] block text-gray-500 font-medium -mt-0.5">
                  Complaint Intelligence Platform
                </span>
              </div>
            </div>

            {/* Workspace Selector */}
            {activeWorkspace && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50/80 text-xs font-medium text-gray-800 transition"
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  <span className="font-semibold text-gray-900">{activeWorkspace.name}</span>
                  <span className="text-gray-400">({activeWorkspace.industry})</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-[11px] font-semibold uppercase text-gray-400 border-b border-gray-100">
                      Switch Demo Company
                    </div>
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          onSelectWorkspace(ws);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50/50 transition ${
                          activeWorkspace.id === ws.id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-900">{ws.name}</div>
                          <div className="text-[10px] text-gray-500">{ws.industry}</div>
                        </div>
                        {activeWorkspace.id === ws.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    ))}
                    <div className="p-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenDemoModal();
                        }}
                        className="w-full text-center py-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Explore All Demo Environments →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDemoModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Demo Workspaces
            </button>

            <button
              onClick={onOpenNewComplaint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Complaint</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
