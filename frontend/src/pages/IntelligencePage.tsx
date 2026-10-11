import React, { useEffect, useState } from 'react';
import {
  Activity,
  TrendingUp,
  MapPin,
  Package,
  AlertTriangle,
  Building2,
  Users,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  Flame,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  fetchApi,
  Workspace,
  ProductIntelligenceItem,
  CustomerIntelligenceItem
} from '../api/client';
import { useTheme } from '../context/ThemeContext';

interface IntelligencePageProps {
  activeWorkspace: Workspace;
  onSelectTicket?: (ticketId: string) => void;
}

export const IntelligencePage: React.FC<IntelligencePageProps> = ({
  activeWorkspace,
  onSelectTicket,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'recurring' | 'products' | 'customers' | 'locations'>('overview');
  const [trendsData, setTrendsData] = useState<any>(null);
  const [productsData, setProductsData] = useState<ProductIntelligenceItem[]>([]);
  const [customersData, setCustomersData] = useState<CustomerIntelligenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cluster drill-down modal state
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [clusterComplaints, setClusterComplaints] = useState<any[]>([]);
  const [clusterLoading, setClusterLoading] = useState(false);

  useEffect(() => {
    loadAllIntelligence();
  }, [activeWorkspace.id]);

  const loadAllIntelligence = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tRes, pRes, cRes] = await Promise.all([
        fetchApi<any>(`/intelligence/trends?workspace_id=${activeWorkspace.id}`),
        fetchApi<ProductIntelligenceItem[]>(`/intelligence/products?workspace_id=${activeWorkspace.id}`),
        fetchApi<CustomerIntelligenceItem[]>(`/intelligence/customers?workspace_id=${activeWorkspace.id}`),
      ]);
      setTrendsData(tRes);
      setProductsData(pRes);
      setCustomersData(cRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClusterDrilldown = async (clusterName: string) => {
    setSelectedCluster(clusterName);
    try {
      setClusterLoading(true);
      const complaints = await fetchApi<any[]>(
        `/intelligence/clusters/${encodeURIComponent(clusterName)}/complaints?workspace_id=${activeWorkspace.id}`
      );
      setClusterComplaints(complaints);
    } catch (err) {
      console.error(err);
      setClusterComplaints([]);
    } finally {
      setClusterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 max-w-7xl mx-auto text-center space-y-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mining complaint clusters & cross-functional trends...</p>
      </div>
    );
  }

  if (error || !trendsData) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm">
          Failed to load intelligence data: {error}
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: isDark ? '#0D1B2A' : '#FFFFFF',
    borderRadius: '12px',
    border: isDark ? '1px solid #23364D' : '1px solid #E2E8F0',
    color: isDark ? '#F8FAFC' : '#0F172A',
    fontSize: '12px',
    boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.15)',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#23364D]">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Intelligence & Discovery
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Understand → Discover → Act
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Proactive root-cause pattern detection, recurring complaint clusters, product defect risk, and churn signals.
        </p>
      </div>

      {/* Horizontally Scrollable Navigation Tabs (Touch-friendly & Responsive) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#23364D] overflow-x-auto no-scrollbar text-sm font-semibold pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'trends', label: 'Trends' },
          { id: 'recurring', label: `Recurring Issues (${trendsData.recurring_issues?.length || 0})` },
          { id: 'products', label: `Products (${productsData.length})` },
          { id: 'customers', label: `Customers (${customersData.length})` },
          { id: 'locations', label: 'Locations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer min-h-[44px] flex items-center ${
              activeTab === tab.id
                ? 'border-[#0F2A5F] dark:border-blue-400 text-[#0F2A5F] dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Possible Root Cause Patterns */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Identified Root-Cause Hypotheses</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Linguistic and operational co-occurrences of entities, logistics hubs, and failure modes
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                Possible Root-Cause Pattern (Academic Integrity)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trendsData.possible_root_causes && trendsData.possible_root_causes.length > 0 ? (
                trendsData.possible_root_causes.map((rc: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card hover:border-blue-400 dark:hover:border-blue-500 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          {rc.pattern_name}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{rc.count} complaints</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">{rc.associated_factor}</h3>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {rc.affected_location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>Location: <strong>{rc.affected_location}</strong></span>
                          </div>
                        )}
                        {rc.affected_entity && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Entity: <strong>{rc.affected_entity}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {rc.recommendation && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#23364D] text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#13263A] p-3 rounded-xl">
                        <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">Recommended Directive:</span>
                        {rc.recommendation}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-400 col-span-3">No distinct root causes detected.</div>
              )}
            </div>
          </div>

          {/* Department Workload & Customer Intents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Customer Underlying Intents</h3>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mb-4">What customers want (Refund, Replacement, Status, etc.)</p>
              <div className="h-60 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData.top_intents} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={{ stroke: isDark ? '#23364D' : '#E2E8F0' }} />
                    <YAxis dataKey="intent" type="category" width={140} tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={{ stroke: isDark ? '#23364D' : '#E2E8F0' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill={isDark ? '#3B82F6' : '#0F2A5F'} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Department Workload Distribution</h3>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mb-4">Operational bandwidth requirements across support units</p>
              <div className="h-60 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData.department_workload} margin={{ left: -20, right: 10 }}>
                    <XAxis dataKey="department" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={{ stroke: isDark ? '#23364D' : '#E2E8F0' }} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={{ stroke: isDark ? '#23364D' : '#E2E8F0' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill={isDark ? '#60A5FA' : '#2563EB'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TRENDS ================= */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Period-Over-Period Category Shift</h3>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mb-5">Velocity of complaint categories in recent windows</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendsData.recurring_issues?.map((issue: any) => (
                <div key={issue.cluster_name} className="p-4 bg-slate-50 dark:bg-[#13263A] rounded-xl border border-slate-200 dark:border-[#23364D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{issue.category}</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${issue.trend_pct > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {issue.trend_pct > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : null}
                      {issue.trend_pct > 0 ? `+${issue.trend_pct}%` : `${issue.trend_pct}%`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{issue.cluster_name}</p>
                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-200 dark:border-[#23364D] flex justify-between">
                    <span>Complaints: {issue.count}</span>
                    <span>Avg Urgency: {issue.avg_urgency}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: RECURRING ISSUES ================= */}
      {activeTab === 'recurring' && (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Click any recurring issue cluster to open constituent tickets in a detailed review drawer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trendsData.recurring_issues?.map((issue: any) => (
              <div
                key={issue.cluster_name}
                onClick={() => handleOpenClusterDrilldown(issue.cluster_name)}
                className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {issue.category}
                    </span>
                    {issue.is_emerging && (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> Emerging (+{issue.trend_pct}%)
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">{issue.cluster_name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                    {issue.possible_root_cause || 'Recurring operational pattern identified.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#23364D] flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{issue.count} complaints</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    Drill down <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: PRODUCTS ================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-[#13263A] border-b border-slate-200 dark:border-[#23364D] text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Complaints</th>
                    <th className="py-3.5 px-4">Defect Rate</th>
                    <th className="py-3.5 px-4">Return Risk</th>
                    <th className="py-3.5 px-4">Primary Failure Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23364D]">
                  {productsData.map((p) => (
                    <tr key={p.product_name} className="hover:bg-slate-50/50 dark:hover:bg-[#13263A]/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.product_name}</td>
                      <td className="py-3.5 px-4">{p.complaint_count}</td>
                      <td className="py-3.5 px-4 font-semibold text-rose-600 dark:text-rose-400">{p.defect_rate}%</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.return_risk === 'High'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : p.return_risk === 'Medium'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {p.return_risk} Risk
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">{p.primary_complaint_category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CUSTOMERS ================= */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-[#13263A] border-b border-slate-200 dark:border-[#23364D] text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Complaints</th>
                    <th className="py-3.5 px-4">Avg Urgency</th>
                    <th className="py-3.5 px-4">Sentiment Trajectory</th>
                    <th className="py-3.5 px-4">Churn Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23364D]">
                  {customersData.map((c) => (
                    <tr key={c.customer_name} className="hover:bg-slate-50/50 dark:hover:bg-[#13263A]/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{c.customer_name}</td>
                      <td className="py-3.5 px-4">{c.complaint_count}</td>
                      <td className="py-3.5 px-4">{c.avg_urgency}/100</td>
                      <td className="py-3.5 px-4 text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">{c.sentiment_trend}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          c.churn_risk === 'Critical' || c.churn_risk === 'High'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : c.churn_risk === 'Medium'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {c.churn_risk} Churn Risk
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: LOCATIONS ================= */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trendsData.top_locations?.map((loc: any) => (
              <div key={loc.location} className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{loc.location}</h4>
                  </div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    {loc.count} tickets
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recurring logistics bottlenecks and delivery friction concentrated in this metro area.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= CLUSTER DRILLDOWN MODAL ================= */}
      {selectedCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl p-6 max-w-2xl w-full shadow-modal border border-slate-200 dark:border-[#23364D] space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#23364D]">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCluster}</h3>
                <p className="text-xs text-slate-400">Constituent complaints forming this issue cluster</p>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {clusterLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading cluster complaints...</div>
              ) : clusterComplaints.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No constituent complaints found.</div>
              ) : (
                clusterComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCluster(null);
                      if (onSelectTicket) onSelectTicket(c.id);
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-[#23364D] hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50 dark:bg-[#13263A] transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">#{c.id}</span>
                      <span className="text-slate-400">{c.customer_name}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                      {c.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
