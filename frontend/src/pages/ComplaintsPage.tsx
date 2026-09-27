import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  Clock, 
  AlertCircle, 
  ArrowUpDown, 
  ChevronRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { fetchApi, TicketListItem, Workspace } from '../api/client';

interface ComplaintsPageProps {
  activeWorkspace: Workspace;
  onSelectTicket: (ticketId: string) => void;
  onOpenNewComplaint: () => void;
  initialCategoryFilter?: string;
}

export const ComplaintsPage: React.FC<ComplaintsPageProps> = ({
  activeWorkspace,
  onSelectTicket,
  onOpenNewComplaint,
  initialCategoryFilter,
}) => {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter || '');
  const [intentFilter, setIntentFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTickets();
  }, [
    activeWorkspace.id,
    categoryFilter,
    intentFilter,
    sentimentFilter,
    urgencyFilter,
    statusFilter,
    departmentFilter,
  ]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ workspace_id: activeWorkspace.id });
      if (categoryFilter) params.append('category', categoryFilter);
      if (intentFilter) params.append('intent', intentFilter);
      if (sentimentFilter) params.append('sentiment', sentimentFilter);
      if (urgencyFilter) params.append('urgency_level', urgencyFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (departmentFilter) params.append('department', departmentFilter);
      if (searchQuery) params.append('search', searchQuery);

      const data = await fetchApi<TicketListItem[]>(`/tickets?${params.toString()}`);
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTickets();
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'Positive':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Positive</span>;
      case 'Negative':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Negative</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Neutral</span>;
    }
  };

  const getUrgencyBadge = (urgency?: string, score?: number) => {
    switch (urgency) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Critical {score ? `(${score})` : ''}</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800">High {score ? `(${score})` : ''}</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">Medium {score ? `(${score})` : ''}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">Low {score ? `(${score})` : ''}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">Resolved</span>;
      case 'escalated':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-800">Escalated</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-100 text-sky-800">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">Open</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Complaints Workbench
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {tickets.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Filter by NLP-derived dimensions (Topic, Intent, Sentiment, Urgency) or execute semantic queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTickets()}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewComplaint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Complaint</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, complaint ID, subject, text keyword, product, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {activeWorkspace.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Intent */}
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Intents</option>
            <option value="Request Refund">Request Refund</option>
            <option value="Request Replacement">Request Replacement</option>
            <option value="Track Order">Track Order</option>
            <option value="Cancel Order">Cancel Order</option>
            <option value="Report Payment Problem">Report Payment Problem</option>
            <option value="Report Technical Problem">Report Technical Problem</option>
            <option value="Report Problem">Report Problem</option>
            <option value="Escalate Complaint">Escalate Complaint</option>
            <option value="Ask Question">Ask Question</option>
          </select>

          {/* Sentiment */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Sentiments</option>
            <option value="Negative">Negative</option>
            <option value="Neutral">Neutral</option>
            <option value="Positive">Positive</option>
          </select>

          {/* Urgency */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Urgencies</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Reset button */}
          {(categoryFilter || intentFilter || sentimentFilter || urgencyFilter || statusFilter || departmentFilter || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setIntentFilter('');
                setSentimentFilter('');
                setUrgencyFilter('');
                setStatusFilter('');
                setDepartmentFilter('');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            Loading complaints...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">No complaints match your criteria</div>
            <p className="text-xs text-slate-400 mt-1">Try clearing or adjusting your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Intent</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {t.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      <div>{t.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{t.customer_email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-xs truncate" title={t.subject}>
                      {t.subject}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {t.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {t.intent || 'Report Problem'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSentimentBadge(t.sentiment)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getUrgencyBadge(t.urgency_level, t.urgency_score)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {t.assigned_department || t.recommended_department || 'Support'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {t.created_at ? t.created_at.slice(0, 10) : ''}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
