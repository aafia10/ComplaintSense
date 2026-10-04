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
        return <ShoppingBag className="w-5 h-5 text-emerald-700" />;
      case 'saas':
        return <Cloud className="w-5 h-5 text-sky-600" />;
      case 'logistics':
        return <Truck className="w-5 h-5 text-amber-600" />;
      case 'telecommunications':
      case 'telecom':
        return <Radio className="w-5 h-5 text-emerald-800" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-2">
            <span>Preconfigured Enterprise Workspaces</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Explore Demo Workspaces</h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose an industry environment with pre-seeded complaints, knowledge base policies, and active anomaly clusters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => onSelectWorkspace(ws)}
              className="group p-4 rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer bg-white relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-emerald-50 transition">
                    {getIcon(ws.industry)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {ws.industry}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                  {ws.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {ws.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-700">
                <span>{ws.ticket_count || 45}+ Complaints</span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-semibold">
                  Launch Demo <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
