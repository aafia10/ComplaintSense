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
  Inbox
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
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Synthesizing workspace complaint intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          Failed to load overview: {error}
        </div>
      </div>
    );
  }

  const { kpis, volume_trends, top_drivers, sentiment_breakdown, needs_attention, emerging_issue } = data;

  const renderDelta = (deltaPct: number, invertSentiment = false) => {
    const isPositive = deltaPct > 0;
    const isZero = deltaPct === 0;
    // For complaints, an increase is generally negative for operations
    const isWarning = invertSentiment ? !isPositive : isPositive;

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
          isZero ? 'text-slate-400' : isWarning ? 'text-rose-600' : 'text-emerald-700'
        }`}
      >
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : !isZero ? <TrendingDown className="w-3.5 h-3.5" /> : null}
        <span>{deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}</span>
        <span className="text-[10px] font-normal text-slate-400 ml-1">vs prior {days}d</span>
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Executive Complaint Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational complaint volume, customer sentiment drivers, and real-time anomaly detection.
          </p>
        </div>

        {/* Date Filter selector */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-2xs self-start sm:self-auto">
          {[
            { label: '7 Days', value: 7 },
            { label: '30 Days', value: 30 },
            { label: '90 Days', value: 90 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                days === opt.value
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ONE Prominent Emerging Issue Banner (Signature Demo Cluster) */}
      {emerging_issue && (
        <div className="bg-gradient-to-r from-emerald-50/60 via-amber-50/40 to-white border border-amber-300/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                  Emerging Cluster Detected
                </span>
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +{emerging_issue.trend_pct}% growth
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{emerging_issue.cluster_name}</h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                {emerging_issue.possible_root_cause
                  ? `Possible root-cause pattern: ${emerging_issue.possible_root_cause}`
                  : 'High-frequency recurring pattern identified across recent ticket influx.'}
                {emerging_issue.affected_location ? ` Primarily concentrated in ${emerging_issue.affected_location}.` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xl font-bold text-slate-900 block">{emerging_issue.complaint_count}</span>
              <span className="text-[11px] text-slate-400">affected complaints</span>
            </div>
            <button
              onClick={onNavigateToIntelligence}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>View Issue in Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Complaints */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Complaints</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.total_complaints}</div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            {renderDelta(kpis.total_change_pct)}
          </div>
        </div>

        {/* Open Complaints */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Complaints</span>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{kpis.open_complaints}</div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            {renderDelta(kpis.open_change_pct)}
          </div>
        </div>

        {/* Critical Urgency */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Urgency</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{kpis.critical_complaints}</div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            {renderDelta(kpis.critical_change_pct)}
          </div>
        </div>

        {/* Escalated Complaints */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escalated Complaints</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{kpis.escalated_complaints}</div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            {renderDelta(kpis.escalated_change_pct)}
          </div>
        </div>
      </div>

      {/* Main Complaint Volume Time-Series Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Complaint Volume Timeline</h2>
            <p className="text-xs text-slate-400">Daily complaint intake grouped by sentiment classification</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Negative
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Neutral
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Positive
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volume_trends}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.7} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.7} />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#059669" fill="#059669" fillOpacity={0.7} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Insight Cards: Top Drivers (%) & Customer Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Complaint Drivers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Complaint Drivers</h2>
              <p className="text-xs text-slate-400">Share of total volume by category</p>
            </div>
            <button
              onClick={() => onNavigateToComplaints()}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {top_drivers.map((driver) => (
              <div key={driver.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{driver.category}</span>
                  <span className="font-bold text-slate-900">
                    {driver.count} ({driver.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 rounded-full transition-all duration-300"
                    style={{ width: `${driver.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Sentiment Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Customer Sentiment Tone</h2>
              <p className="text-xs text-slate-400">VADER compound polarity distribution</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {sentiment_breakdown.map((s) => {
              const isNeg = s.sentiment === 'Negative';
              const isPos = s.sentiment === 'Positive';
              return (
                <div
                  key={s.sentiment}
                  className={`p-3 rounded-lg border text-center ${
                    isNeg
                      ? 'bg-rose-50/50 border-rose-200 text-rose-800'
                      : isPos
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-semibold block">{s.sentiment}</span>
                  <span className="text-lg font-bold block mt-0.5">{s.count}</span>
                  <span className="text-[10px] opacity-75">{s.percentage}%</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Sentiment polarity is derived from VADER normalized lexical scoring. Critical complaints with severe emotional
            tones (Anger, Threatening) are automatically fast-tracked to senior tier-2 queues.
          </p>
        </div>
      </div>

      {/* Needs Attention List (max 5 items) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Needs Immediate Attention</h2>
            <p className="text-xs text-slate-400">Top prioritized tickets: escalated, critical urgency, or SLA at risk</p>
          </div>
          <button
            onClick={() => onNavigateToComplaints()}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({kpis.total_complaints})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {needs_attention && needs_attention.length > 0 ? (
            needs_attention.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t.id)}
                className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-slate-500">{t.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        t.urgency_level === 'critical' || t.urgency_level === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.urgency_level}
                    </span>
                    {t.status === 'escalated' && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                        Escalated
                      </span>
                    )}
                    <span className="text-xs text-slate-400">• {t.customer_name}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">{t.subject}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs">
                    <span className="font-semibold text-slate-700 block">{t.category || 'General'}</span>
                    <span className="text-[11px] text-slate-400 block">{t.intent || 'Report Problem'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No tickets currently require urgent escalation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
