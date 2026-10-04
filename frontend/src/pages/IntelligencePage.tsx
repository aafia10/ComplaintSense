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
  X
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

interface IntelligencePageProps {
  activeWorkspace: Workspace;
  onSelectTicket?: (ticketId: string) => void;
}

export const IntelligencePage: React.FC<IntelligencePageProps> = ({
  activeWorkspace,
  onSelectTicket,
}) => {
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
      const [trends, products, customers] = await Promise.all([
        fetchApi<any>(`/intelligence/trends?workspace_id=${activeWorkspace.id}`),
        fetchApi<ProductIntelligenceItem[]>(`/intelligence/products?workspace_id=${activeWorkspace.id}`),
        fetchApi<CustomerIntelligenceItem[]>(`/intelligence/customers?workspace_id=${activeWorkspace.id}`),
      ]);
      setTrendsData(trends);
      setProductsData(products);
      setCustomersData(customers);
    } catch (err: any) {
      setError(err.message || 'Failed to load intelligence analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClusterDrilldown = async (clusterName: string) => {
    try {
      setSelectedCluster(clusterName);
      setClusterLoading(true);
      const res = await fetchApi<any>(`/intelligence/clusters/${encodeURIComponent(clusterName)}/complaints?workspace_id=${activeWorkspace.id}`);
      setClusterComplaints(res.complaints || []);
    } catch (err) {
      console.error(err);
      setClusterComplaints([]);
    } finally {
      setClusterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 max-w-7xl mx-auto text-center">
        <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Aggregating cross-department intelligence patterns...</p>
      </div>
    );
  }

  if (error || !trendsData) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          Failed to load intelligence data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Intelligence & Discovery
          </h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            Understand → Discover
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Root-cause pattern detection, recurring clusters, product risk ranking, and repeat complainant tracking.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
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
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Possible Root Cause Patterns */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  <span>Identified Root-Cause Hypotheses</span>
                </h2>
                <p className="text-xs text-slate-400">Co-occurrences of external entities, locations, and failure modes</p>
              </div>
              <span className="text-[10px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                Transparently Disclaimed: Possible Root Cause
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendsData.possible_root_causes && trendsData.possible_root_causes.length > 0 ? (
                trendsData.possible_root_causes.map((rc: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-500 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                          {rc.pattern_name}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{rc.count} complaints</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mb-2">{rc.associated_factor}</h3>

                      <div className="space-y-1 text-xs text-slate-600">
                        {rc.affected_location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>Location: <strong>{rc.affected_location}</strong></span>
                          </div>
                        )}
                        {rc.affected_entity && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Entity: <strong>{rc.affected_entity}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {rc.recommendation && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-700 bg-slate-50/70 p-2 rounded-lg">
                        <span className="font-semibold text-emerald-800 block text-[11px]">Recommended Directive:</span>
                        {rc.recommendation}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 col-span-3">No distinct root causes detected.</div>
              )}
            </div>
          </div>

          {/* Department Workload & Customer Intents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Customer Underlying Intents</h3>
              <p className="text-xs text-slate-400 mb-4">What customers want (Refund, Replacement, Status, etc.)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData.top_intents} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="intent" type="category" width={130} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#047857" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Department Workload Distribution</h3>
              <p className="text-xs text-slate-400 mb-4">Required operational bandwidth across divisions</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData.department_workload}>
                    <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRENDS */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Intake Timeline & Historical Trajectory</h2>
            <p className="text-xs text-slate-400 mb-4">Time-series volume evolution with sentiment distribution</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData.trends}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="negative" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="neutral" stackId="1" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="positive" stackId="1" stroke="#059669" fill="#059669" fillOpacity={0.7} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendsData.top_categories?.map((cat: any) => (
              <div key={cat.category} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-slate-800 block">{cat.category}</span>
                  <span className="text-[11px] text-slate-400">Total reported complaints</span>
                </div>
                <span className="text-lg font-bold text-emerald-800">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RECURRING ISSUES (with drill-down) */}
      {activeTab === 'recurring' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Mathematically Aggregated Issue Clusters</h2>
                <p className="text-xs text-slate-400">Click any cluster to inspect constituent complaints</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {trendsData.recurring_issues?.length || 0} active clusters
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {trendsData.recurring_issues?.map((issue: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleOpenClusterDrilldown(issue.cluster_name)}
                  className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition">
                        {issue.cluster_name}
                      </span>
                      {issue.is_emerging && (
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                          Emerging
                        </span>
                      )}
                      <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200/50">
                        {issue.complaint_count} tickets
                      </span>
                    </div>

                    {issue.possible_root_cause && (
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Root-Cause Pattern:</span> {issue.possible_root_cause}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {issue.common_terms?.slice(0, 4).map((t: string, ti: number) => (
                        <span key={ti} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-600 block">+{issue.trend_pct}% growth</span>
                      <span className="text-[10px] text-slate-400">Drill down →</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Product Quality & Defect Intelligence</h2>
            <p className="text-xs text-slate-400">Ranked by overall operational risk score (Volume × Urgency × Negative Ratio)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Complaints</th>
                  <th className="py-3 px-4">Avg Urgency</th>
                  <th className="py-3 px-4">Primary Category</th>
                  <th className="py-3 px-4">Top Intent</th>
                  <th className="py-3 px-4">Negative %</th>
                  <th className="py-3 px-4">Risk Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productsData.map((p) => (
                  <tr key={p.product_name} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.product_name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{p.complaint_count}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{p.average_urgency} / 100</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {p.dominant_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-semibold text-[11px]">{p.top_intent}</td>
                    <td className="py-3 px-4 text-rose-600 font-bold">{p.negative_sentiment_pct}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.severity === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : p.severity === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.severity} ({p.risk_score})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Customer Risk & Repeat Complainant Radar</h2>
            <p className="text-xs text-slate-400">Accounts with repeated grievances, chronic escalations, or high churn risk</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Total Complaints</th>
                  <th className="py-3 px-4">Escalations</th>
                  <th className="py-3 px-4">Avg Urgency</th>
                  <th className="py-3 px-4">Risk Tier</th>
                  <th className="py-3 px-4">Last Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersData.map((c) => (
                  <tr key={c.customer_email || c.customer_name} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.customer_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{c.customer_email}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.total_complaints}</td>
                    <td className="py-3 px-4 text-rose-600 font-bold">{c.escalated_count}</td>
                    <td className="py-3 px-4 font-mono">{c.average_urgency}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.risk_level === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : c.risk_level === 'High'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{c.last_complaint_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: LOCATIONS */}
      {activeTab === 'locations' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Geographic Complaint Densities</h2>
              <p className="text-xs text-slate-400">Locations extracted from NER entities across workspace tickets</p>
            </div>
          </div>

          <div className="space-y-3">
            {trendsData.affected_locations?.map((loc: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 w-4">#{idx + 1}</span>
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-semibold text-slate-800">{loc.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-700 h-full rounded-full"
                      style={{ width: `${Math.min(100, loc.count * 15)}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-900 w-8 text-right">{loc.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cluster Constituent Complaints Drilldown Modal */}
      {selectedCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cluster Drill-Down: {selectedCluster}</h3>
                <p className="text-xs text-slate-400">{clusterComplaints.length} constituent complaints in cluster</p>
              </div>
              <button onClick={() => setSelectedCluster(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 text-xs">
              {clusterLoading ? (
                <div className="py-8 text-center text-slate-400">Loading complaints in cluster...</div>
              ) : clusterComplaints.length > 0 ? (
                clusterComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectTicket) onSelectTicket(c.id);
                      setSelectedCluster(null);
                    }}
                    className="py-3 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-slate-800">{c.id}</span>
                        <span className="text-slate-500 font-medium">{c.customer_name}</span>
                        <span className="text-[10px] text-slate-400">{c.created_at.slice(0, 10)}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{c.subject}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">No constituent complaints found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
