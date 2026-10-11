import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Inbox,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { fetchApi, OverviewData, Workspace } from '../api/client';
import { useTheme } from '../context/ThemeContext';

interface OverviewPageProps {
  activeWorkspace: Workspace;
  onNavigateToComplaints: (filterCategory?: string) => void;
  onNavigateToIntelligence: () => void;
  onSelectTicket: (ticketId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  activeWorkspace,
  onNavigateToComplaints,
  onNavigateToIntelligence,
  onSelectTicket,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState<OverviewData | null>(null);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverviewData();
  }, [activeWorkspace.id, days]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi<OverviewData>(`/intelligence/overview?workspace_id=${activeWorkspace.id}&days=${days}`);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Skeleton Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#23364D] animate-pulse">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-[#13263A] rounded-lg"></div>
            <div className="h-4 w-96 bg-slate-100 dark:bg-[#0D1B2A] rounded"></div>
          </div>
          <div className="h-10 w-48 bg-slate-200 dark:bg-[#13263A] rounded-lg"></div>
        </div>

        {/* Skeleton KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] rounded-xl p-5 space-y-3">
              <div className="h-4 w-28 bg-slate-200 dark:bg-[#13263A] rounded"></div>
              <div className="h-8 w-16 bg-slate-200 dark:bg-[#13263A] rounded"></div>
            </div>
          ))}
        </div>

        {/* Skeleton Chart */}
        <div className="h-72 bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] rounded-xl p-5 animate-pulse">
          <div className="h-5 w-48 bg-slate-200 dark:bg-[#13263A] rounded mb-4"></div>
          <div className="h-48 w-full bg-slate-100 dark:bg-[#13263A]/40 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2 mb-2 font-bold text-base">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Failed to load overview data</span>
          </div>
          <p className="text-sm">{error || 'Unknown error occurred while contacting backend API.'}</p>
          <button
            onClick={loadOverviewData}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { kpis, volume_trends, top_drivers, sentiment_breakdown, needs_attention, emerging_issue } = data;

  const renderDelta = (deltaPct: number, invertSentiment = false) => {
    const isPositive = deltaPct > 0;
    const isZero = deltaPct === 0;
    const isWarning = invertSentiment ? !isPositive : isPositive;

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-bold ${
          isZero
            ? 'text-slate-400 dark:text-slate-400'
            : isWarning
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-emerald-700 dark:text-emerald-400'
        }`}
      >
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : !isZero ? <TrendingDown className="w-3.5 h-3.5" /> : null}
        <span>{deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}</span>
        <span className="text-xs font-normal text-slate-400 dark:text-slate-400 ml-1">vs prior {days}d</span>
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#23364D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Executive Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time complaint intake, customer sentiment velocity, and proactive issue detection.
          </p>
        </div>

        {/* Date Filter Selector */}
        <div className="flex items-center bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] rounded-xl p-1 shadow-subtle self-start sm:self-auto">
          {[
            { label: '7 Days', value: 7 },
            { label: '30 Days', value: 30 },
            { label: '90 Days', value: 90 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all min-h-[38px] cursor-pointer ${
                days === opt.value
                  ? 'bg-[#0F2A5F] dark:bg-blue-600 text-white shadow-subtle'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#13263A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ONE Prominent Emerging Issue Banner (Signature Demo Cluster) */}
      {emerging_issue && (
        <div className="bg-gradient-to-r from-blue-50/80 via-amber-50/40 to-white dark:from-[#13263A] dark:via-[#0D1B2A] dark:to-[#0D1B2A] border border-amber-300 dark:border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-subtle">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/50">
                  Signature Emerging Issue
                </span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{emerging_issue.trend_pct}% growth
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1.5">{emerging_issue.cluster_name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {emerging_issue.possible_root_cause
                  ? `Possible root-cause pattern: ${emerging_issue.possible_root_cause}`
                  : 'High-frequency recurring pattern identified across recent customer complaints.'}
                {emerging_issue.affected_location ? ` Primarily concentrated in ${emerging_issue.affected_location}.` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-amber-200 dark:border-[#23364D]">
            <div className="text-left lg:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white block">{emerging_issue.complaint_count}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">affected complaints</span>
            </div>
            <button
              onClick={onNavigateToIntelligence}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-subtle transition-all cursor-pointer min-h-[44px]"
            >
              <span>Explore Root Cause</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Complaints */}
        <div className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Complaints</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">{kpis.total_complaints}</div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#23364D] flex items-center justify-between">
            {renderDelta(kpis.total_change_pct)}
          </div>
        </div>

        {/* Open Complaints */}
        <div className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Open Workload</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#0F2A5F] dark:text-blue-400 mt-1.5 tracking-tight">{kpis.open_complaints}</div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#23364D] flex items-center justify-between">
            {renderDelta(kpis.open_change_pct)}
          </div>
        </div>

        {/* Critical Urgency */}
        <div className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Critical Urgency</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 mt-1.5 tracking-tight">{kpis.critical_complaints}</div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#23364D] flex items-center justify-between">
            {renderDelta(kpis.critical_change_pct)}
          </div>
        </div>

        {/* Escalated Complaints */}
        <div className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Escalated Tickets</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 mt-1.5 tracking-tight">{kpis.escalated_complaints}</div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#23364D] flex items-center justify-between">
            {renderDelta(kpis.escalated_change_pct)}
          </div>
        </div>
      </div>

      {/* Main Complaint Volume Time-Series Chart */}
      <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Complaint Volume Timeline</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Daily complaint intake grouped by sentiment classification</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> Negative
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600"></span> Neutral
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-600 dark:bg-emerald-500"></span> Positive
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volume_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="neuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }}
                axisLine={{ stroke: isDark ? '#23364D' : '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }}
                axisLine={{ stroke: isDark ? '#23364D' : '#E2E8F0' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0D1B2A' : '#FFFFFF',
                  borderRadius: '12px',
                  border: isDark ? '1px solid #23364D' : '1px solid #E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '13px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                }}
              />
              <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#negGrad)" name="Negative" />
              <Area type="monotone" dataKey="neutral" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#neuGrad)" name="Neutral" />
              <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#posGrad)" name="Positive" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Section on Desktop, Stacked on Mobile: Top Drivers + Needs Immediate Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Complaint Drivers */}
        <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Top Complaint Drivers</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Categories driving the highest volume of grievances</p>
              </div>
              <button
                onClick={() => onNavigateToComplaints()}
                className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {top_drivers.map((driver, idx) => (
                <div
                  key={driver.category}
                  onClick={() => onNavigateToComplaints(driver.category)}
                  className="group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#13263A] transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-[#23364D]"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                      {idx + 1}. {driver.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{driver.count} tickets</span>
                      <span className="font-bold text-slate-900 dark:text-white">{driver.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#13263A] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F2A5F] dark:bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${driver.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#23364D] flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Customer Sentiment: {sentiment_breakdown.negative_pct}% Negative</span>
            <span>Net Satisfaction: {sentiment_breakdown.positive_pct}% Positive</span>
          </div>
        </div>

        {/* Needs Immediate Attention (Max 5 Critical Tickets) */}
        <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Needs Immediate Attention</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Critical complaints approaching SLA escalation</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Top Priority
              </span>
            </div>

            <div className="space-y-3">
              {needs_attention.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket.id)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-[#23364D] hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-[#13263A] transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#13263A] px-2 py-0.5 rounded">
                        {ticket.id}
                      </span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        Urgency {ticket.urgency_score}/100
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-400 hidden sm:inline">
                        • {ticket.customer_name}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{ticket.subject}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(ticket.id);
                    }}
                    className="shrink-0 p-2 text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                    aria-label={`View ticket ${ticket.id}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#23364D]">
            <button
              onClick={() => onNavigateToComplaints()}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] hover:bg-slate-50 dark:hover:bg-[#13263A] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>Explore All Filtered Complaints</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
