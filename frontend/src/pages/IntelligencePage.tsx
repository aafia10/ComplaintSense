import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  MapPin, 
  Package, 
  AlertTriangle, 
  Building2, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  Compass
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { fetchApi, Workspace } from '../api/client';

interface IntelligencePageProps {
  activeWorkspace: Workspace;
}

export const IntelligencePage: React.FC<IntelligencePageProps> = ({
  activeWorkspace,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIntelligence();
  }, [activeWorkspace.id]);

  const loadIntelligence = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi(`/intelligence/trends?workspace_id=${activeWorkspace.id}`);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load intelligence analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <div className="text-xs text-slate-500 font-medium">Aggregating cross-department intelligence patterns...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          Failed to load intelligence data: {error}
        </div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Management Complaint Intelligence
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50">
            Strategic Layer
          </span>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          Translating unstructured customer complaints into operational root-cause hypotheses, geographic clusters, and recurring product defect trends.
        </p>
      </div>

      {/* Prominent Root Cause Pattern Hypothesis Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              Identified Root-Cause Patterns
            </h2>
            <p className="text-xs text-slate-400">
              Correlated co-occurrences of entities, logistics partners, and regional hubs
            </p>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            Transparently Disclaimed: Possible Root Cause
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.possible_root_causes && data.possible_root_causes.length > 0 ? (
            data.possible_root_causes.map((rc: any, idx: number) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {rc.pattern_name}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {rc.count} complaints
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    {rc.associated_factor}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-600">
                    {rc.affected_location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span><strong>Location:</strong> {rc.affected_location}</span>
                      </div>
                    )}
                    {rc.affected_entity && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span><strong>Entity:</strong> {rc.affected_entity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {rc.recommendation && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl">
                    <span className="font-bold text-indigo-600 block mb-0.5">Management Action:</span>
                    {rc.recommendation}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 col-span-3">
              No strong co-occurrence patterns detected.
            </div>
          )}
        </div>
      </div>

      {/* Intents vs Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Customer Intents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Underlying Customer Intents</h3>
              <p className="text-xs text-slate-400">What do customers actually want?</p>
            </div>
            <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Intent vs Topic
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_intents} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="intent" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload Allocation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Workload Distribution</h3>
              <p className="text-xs text-slate-400">Where operational effort is demanded</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.department_workload}>
                <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Geographic & Product Impact Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Most Affected Locations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900">Top Geographic Concentrations</h3>
            </div>
            <span className="text-xs text-slate-400">NER Location Entity</span>
          </div>

          <div className="space-y-3">
            {data.affected_locations && data.affected_locations.length > 0 ? (
              data.affected_locations.map((loc: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <span className="font-semibold text-slate-800">{loc.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full" 
                        style={{ width: `${Math.min(100, loc.count * 10)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 w-8 text-right">{loc.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">No location entities detected.</div>
            )}
          </div>
        </div>

        {/* Most Affected Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900">Most Frequently Mentioned Products</h3>
            </div>
            <span className="text-xs text-slate-400">NER Product Entity</span>
          </div>

          <div className="space-y-3">
            {data.affected_products && data.affected_products.length > 0 ? (
              data.affected_products.map((prod: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <span className="font-semibold text-slate-800">{prod.product}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full" 
                        style={{ width: `${Math.min(100, prod.count * 15)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 w-8 text-right">{prod.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">No product entities detected.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
