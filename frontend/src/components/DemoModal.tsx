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
        return <ShoppingBag className="w-6 h-6 text-indigo-600" />;
      case 'saas':
        return <Cloud className="w-6 h-6 text-sky-600" />;
      case 'logistics':
        return <Truck className="w-6 h-6 text-emerald-600" />;
      case 'telecommunications':
      case 'telecom':
        return <Radio className="w-6 h-6 text-purple-600" />;
      default:
        return <ShoppingBag className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-gray-100 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2">
            <span>Pre-Configured Environments</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Explore Demo Workspaces</h2>
          <p className="text-sm text-gray-500 mt-1">
            ComplaintSense adapts across multi-sector enterprises. Choose an industry environment with real seeded complaints and local knowledge policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => onSelectWorkspace(ws)}
              className="group p-5 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer bg-white relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-gray-50 group-hover:bg-indigo-50/50 transition">
                    {getIcon(ws.industry)}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {ws.industry}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                  {ws.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {ws.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-indigo-600">
                <span>{ws.ticket_count || 50}+ Seeded Complaints</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
