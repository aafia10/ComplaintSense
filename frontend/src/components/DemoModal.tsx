import React from 'react';
import { ShoppingBag, Cloud, Truck, Radio, ArrowRight, X } from 'lucide-react';
import { Workspace } from '../api/client';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  onSelectWorkspace,
}) => {
  if (!isOpen) return null;

  const getIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'e-commerce':
        return <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'saas':
        return <Cloud className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'logistics':
        return <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'telecommunications':
      case 'telecom':
        return <Radio className="w-5 h-5 text-blue-700 dark:text-blue-300" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl shadow-modal max-w-2xl w-full p-6 sm:p-7 border border-slate-200 dark:border-[#23364D] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
            <span>Preconfigured Enterprise Workspaces</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Explore Demo Workspaces</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose an industry environment with pre-seeded complaints, knowledge base policies, and active anomaly clusters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => onSelectWorkspace(ws)}
              className="group p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-card transition-all cursor-pointer bg-slate-50/50 dark:bg-[#13263A]/70 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition">
                    {getIcon(ws.industry)}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-300">
                    {ws.industry}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {ws.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {ws.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-[#23364D] flex items-center justify-between text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                <span>{ws.ticket_count || 45}+ Complaints</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                  Launch Demo <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#23364D] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#13263A] rounded-xl transition cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
