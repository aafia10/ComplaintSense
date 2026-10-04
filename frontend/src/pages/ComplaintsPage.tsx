import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Layers,
  ChevronRight,
  RefreshCw,
  Plus,
  Download,
  Upload,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { fetchApi, TicketListItem, Workspace } from '../api/client';
import { CsvImportModal } from '../components/CsvImportModal';

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

  // Tabs: 'all' vs 'needs_review'
  const [activeTab, setActiveTab] = useState<'all' | 'needs_review'>('all');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter || '');
  const [intentFilter, setIntentFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [
    activeWorkspace.id,
    activeTab,
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
      if (activeTab === 'needs_review') {
        params.append('needs_review', 'true');
      }
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

  const handleExportCsv = () => {
    const params = new URLSearchParams({ workspace_id: activeWorkspace.id });
    if (statusFilter) params.append('status', statusFilter);
    if (categoryFilter) params.append('category', categoryFilter);
    window.open(`http://localhost:8000/api/data/export-csv?${params.toString()}`, '_blank');
  };

  const getUrgencyBadge = (urgency?: string, score?: number) => {
    const u = (urgency || '').toLowerCase();
    switch (u) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Critical {score ? `(${score})` : ''}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            High {score ? `(${score})` : ''}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            Medium {score ? `(${score})` : ''}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800">
            Low {score ? `(${score})` : ''}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">Resolved</span>;
      case 'escalated':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">Escalated</span>;
      case 'in_progress':
      case 'in review':
      case 'in_review':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">In Review</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">Open</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Bulk Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Customer Complaints</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {tickets.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            NLP-indexed complaint repository with multi-field search, sentiment, and urgency classification.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Export filtered complaints to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Bulk CSV Import */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Import complaints from CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          {/* Refresh List */}
          <button
            onClick={() => loadTickets()}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition cursor-pointer"
            title="Refresh complaints"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs: All Complaints vs Needs Review (Low-confidence queue) */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          All Complaints
        </button>
        <button
          onClick={() => setActiveTab('needs_review')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'needs_review'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Needs Review (Confidence &lt; 60%)</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, subject, complaint ID, product name, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">Filter:</span>
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Topics</option>
            {activeWorkspace.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Intent */}
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs focus:outline-none cursor-pointer"
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

          {/* Urgency */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white font-medium text-slate-700 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Review</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Clear filters */}
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
              className="text-xs text-rose-600 hover:text-rose-800 font-medium ml-auto cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* 8-Column Standardized Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
            Loading complaints...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">No complaints found</div>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or active filter settings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject / Summary</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Intent</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className="hover:bg-emerald-50/30 cursor-pointer transition-colors group"
                  >
                    {/* 1. ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.id}
                    </td>

                    {/* 2. Customer */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{t.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{t.customer_email}</div>
                    </td>

                    {/* 3. Subject / Summary */}
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-xs truncate" title={t.subject}>
                      {t.subject}
                    </td>

                    {/* 4. Topic */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {t.category || 'General'}
                      </span>
                    </td>

                    {/* 5. Intent */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/50">
                        {t.intent || 'Report Problem'}
                      </span>
                    </td>

                    {/* 6. Urgency */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getUrgencyBadge(t.urgency_level, t.urgency_score)}
                    </td>

                    {/* 7. Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(t.status)}
                    </td>

                    {/* 8. Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 transition-colors">
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Bulk Ingestion Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        activeWorkspace={activeWorkspace}
        onImportComplete={() => loadTickets()}
      />
    </div>
  );
};
