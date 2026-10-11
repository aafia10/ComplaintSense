import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ArrowUpRight, 
  Building2, 
  Sparkles,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { fetchApi, DashboardStats, Workspace } from '../api/client';

interface DashboardPageProps {
  activeWorkspace: Workspace;
  onNavigateToComplaints: (filterCategory?: string) => void;
  onSelectTicket: (ticketId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeWorkspace,
  onNavigateToComplaints,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [activeWorkspace.id]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi<DashboardStats>(`/dashboard/stats?workspace_id=${activeWorkspace.id}`);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const SENTIMENT_COLORS: Record<string, string> = {
    Negative: '#f43f5e',
    Neutral: '#94a3b8',
    Positive: '#10b981',
  };

  const URGENCY_COLORS: Record<string, string> = {
    Critical: '#e11d48',
    High: '#f97316',
    Medium: '#facc15',
    Low: '#10b981',
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-slate-500">Calculating complaint intelligence metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  const sentimentPieData = Object.entries(stats.sentiment_distribution).map(([name, value]) => ({
    name,
    value,
  }));

  const urgencyBarData = Object.entries(stats.urgency_distribution).map(([name, value]) => ({
    name,
    value,
  }));

  const categoryBarData = Object.entries(stats.category_distribution).map(([name, value]) => ({
    name: name.replace('&', '+'),
    count: value,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeWorkspace.name} Intelligence Overview
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50">
              {activeWorkspace.industry}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time multi-dimensional complaint analytics, recurring patterns, and operational workload.
          </p>
        </div>

        <button
          onClick={() => onNavigateToComplaints()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
        >
          <Layers className="w-4 h-4 text-slate-500" />
          <span>View All Complaints ({stats.total_complaints})</span>
        </button>
      </div>

      {/* Prominent Emerging Issues Panel */}
      {stats.emerging_issues && stats.emerging_issues.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 p-6 shadow-md shadow-amber-100/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-amber-800">
                Linguistic Anomaly Detected
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Emerging Issue Alert
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {stats.emerging_issues.map((issue, idx) => (
              <div 
                key={idx}
                className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      {issue.cluster_name}
                    </span>
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{issue.trend_pct}%
                    </span>
                  </div>

                  <div className="text-2xl font-extrabold text-slate-900">
                    {issue.complaint_count} <span className="text-xs font-medium text-slate-500">complaints</span>
                  </div>

                  {issue.affected_location && (
                    <div className="text-xs text-slate-600 mt-2">
                      <span className="font-semibold text-slate-700">Affected Location:</span> {issue.affected_location}
                    </div>
                  )}

                  {issue.possible_root_cause && (
                    <div className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-slate-700">Possible Pattern:</span>{' '}
                      <span className="text-amber-900 font-medium">{issue.possible_root_cause}</span>
                    </div>
                  )}
                </div>

                {issue.recommended_action && (
                  <div className="mt-3 pt-3 border-t border-amber-100 text-[11px] text-indigo-700 font-medium">
                    ⚡ Recommendation: {issue.recommended_action}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Volume</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_complaints}</div>
          <div className="text-[11px] text-slate-400 mt-1">Analyzed records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Open Tickets</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{stats.open_complaints}</div>
          <div className="text-[11px] text-indigo-500 mt-1">Requires triage</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Critical Urgency</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats.critical_complaints}</div>
          <div className="text-[11px] text-rose-500 mt-1">Immediate SLA</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Escalated</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.escalated_complaints}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">{stats.escalation_rate}% rate</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Resolved</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{stats.resolved_complaints}</div>
          <div className="text-[11px] text-blue-500 mt-1">Completed actions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Negative Tone</div>
          <div className="text-2xl font-black text-rose-500 mt-1">
            {stats.sentiment_distribution['Negative'] || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">VADER compound &lt; -0.05</div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Time-Series Volume & Sentiment Breakdown */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaint Volume Timeline</h3>
              <p className="text-xs text-slate-400">Daily complaint counts with sentiment distribution</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Negative
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Neutral
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Positive
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.volume_trends}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.6} />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.6} />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sentiment Distribution</h3>
            <p className="text-xs text-slate-400 mb-2">VADER Compound classification</p>

            <div className="h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentPieData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sentimentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {sentimentPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: SENTIMENT_COLORS[item.name] || '#94a3b8' }}
                  />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900">
                  {item.value} ({Math.round((item.value / stats.total_complaints) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Category Breakdown & Urgency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Categories Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaint Categories</h3>
              <p className="text-xs text-slate-400">Predicted domain distributions</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency Levels Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Urgency Level Distribution</h3>
              <p className="text-xs text-slate-400">Transparent signal-based scoring tiers</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={urgencyBarData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                  {urgencyBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.name] || '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Recurring Issues List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Recurring Issue Clusters</h3>
            <p className="text-xs text-slate-400">
              Mathematically aggregated clusters with period-over-period trend percentage
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Calculated from timestamps
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.top_recurring_issues && stats.top_recurring_issues.length > 0 ? (
            stats.top_recurring_issues.map((issue, idx) => (
              <div 
                key={idx}
                className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5 mt-0.5">#{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{issue.cluster_name}</span>
                      {issue.is_emerging && (
                        <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Emerging
                        </span>
                      )}
                    </div>
                    {issue.possible_root_cause && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-600">Possible Pattern:</span> {issue.possible_root_cause}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {issue.common_terms.slice(0, 4).map((term, tIdx) => (
                        <span key={tIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900">
                    {issue.complaint_count} <span className="text-xs font-normal text-slate-500">complaints</span>
                  </div>
                  <div className={`text-xs font-bold flex items-center justify-end gap-0.5 mt-0.5 ${
                    issue.trend_pct >= 0 ? 'text-rose-600' : 'text-blue-600'
                  }`}>
                    {issue.trend_pct >= 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>+{issue.trend_pct}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        <span>{issue.trend_pct}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No recurring issues detected yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
