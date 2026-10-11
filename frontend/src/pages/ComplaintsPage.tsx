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
  ExternalLink,
  X,
  SlidersHorizontal,
  Clock,
  User,
  Tag
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

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  const clearAllFilters = () => {
    setCategoryFilter('');
    setIntentFilter('');
    setSentimentFilter('');
    setUrgencyFilter('');
    setStatusFilter('');
    setDepartmentFilter('');
    setSearchQuery('');
  };

  const activeFilterCount = [
    categoryFilter,
    intentFilter,
    sentimentFilter,
    urgencyFilter,
    statusFilter,
    departmentFilter,
  ].filter(Boolean).length;

  const getUrgencyBadge = (urgency?: string, score?: number) => {
    const u = (urgency || '').toLowerCase();
    switch (u) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400"></span>
            Critical {score !== undefined ? `(${score})` : ''}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400"></span>
            High {score !== undefined ? `(${score})` : ''}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#13263A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#23364D]">
            Medium {score !== undefined ? `(${score})` : ''}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Low {score !== undefined ? `(${score})` : ''}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Resolved
          </span>
        );
      case 'escalated':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Escalated
          </span>
        );
      case 'in_progress':
      case 'in review':
      case 'in_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            In Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#13263A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#23364D]">
            Open
          </span>
        );
    }
  };

  const getSentimentPill = (sentiment?: string) => {
    const s = (sentiment || '').toLowerCase();
    if (s.includes('neg') || s === 'frustrated' || s === 'angry' || s === 'threatening') {
      return (
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200/60 dark:border-rose-800">
          Negative
        </span>
      );
    }
    if (s.includes('pos') || s === 'satisfied') {
      return (
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800">
          Positive
        </span>
      );
    }
    return (
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#13263A] px-2 py-0.5 rounded border border-slate-200 dark:border-[#23364D]">
        Neutral
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Bulk Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#23364D]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Complaints Workbench
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {tickets.length} complaints
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            NLP-classified grievance repository with deep topic, intent, and root-cause intelligence.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#0D1B2A] hover:bg-slate-50 dark:hover:bg-[#13263A] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-subtle transition cursor-pointer min-h-[42px]"
            title="Export filtered complaints to CSV"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Bulk CSV Import */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#0D1B2A] hover:bg-slate-50 dark:hover:bg-[#13263A] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-subtle transition cursor-pointer min-h-[42px]"
            title="Import complaints from CSV"
          >
            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* New Complaint Button */}
          <button
            onClick={onOpenNewComplaint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-subtle transition cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Complaint</span>
          </button>

          {/* Refresh List */}
          <button
            onClick={() => loadTickets()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#0D1B2A] hover:bg-slate-50 dark:hover:bg-[#13263A] text-slate-500 dark:text-slate-400 transition cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
            title="Refresh complaints"
            aria-label="Refresh complaints"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs: All Complaints vs Needs Review (Low-confidence queue) */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-[#23364D]">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer min-h-[44px] ${
            activeTab === 'all'
              ? 'border-[#0F2A5F] dark:border-blue-400 text-[#0F2A5F] dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Complaints
        </button>
        <button
          onClick={() => setActiveTab('needs_review')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer min-h-[44px] ${
            activeTab === 'needs_review'
              ? 'border-[#0F2A5F] dark:border-blue-400 text-[#0F2A5F] dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>Needs Review (Confidence &lt; 65%)</span>
        </button>
      </div>

      {/* Search Bar + Mobile Filter Trigger / Desktop Filter Row */}
      <div className="bg-white dark:bg-[#0D1B2A] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, complaint ID, keyword, product, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#23364D] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/70 dark:bg-[#13263A] text-slate-900 dark:text-white min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition cursor-pointer min-h-[44px]"
          >
            Search
          </button>
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2.5 bg-slate-100 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </form>

        {/* Desktop Filters Bar (hidden on mobile, visible on md+) */}
        <div className="hidden md:flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-[#23364D] text-sm">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold mr-1">
            <Filter className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Filters:</span>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer min-h-[38px]"
          >
            <option value="">All Categories</option>
            <option value="Delivery & Logistics">Delivery & Logistics</option>
            <option value="Billing & Refund">Billing & Refund</option>
            <option value="Product Defect">Product Defect</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Account & Login">Account & Login</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Contract & Legal">Contract & Legal</option>
          </select>

          {/* Intent Filter */}
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer min-h-[38px]"
          >
            <option value="">All Intents</option>
            <option value="Request Refund">Request Refund</option>
            <option value="Request Replacement">Request Replacement</option>
            <option value="Track Order">Track Order</option>
            <option value="Cancel Order">Cancel Order</option>
            <option value="Report Payment Problem">Report Payment Problem</option>
            <option value="Report Technical Problem">Report Technical Problem</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer min-h-[38px]"
          >
            <option value="">All Urgencies</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer min-h-[38px]"
          >
            <option value="">All Sentiments</option>
            <option value="Negative">Negative</option>
            <option value="Neutral">Neutral</option>
            <option value="Positive">Positive</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer min-h-[38px]"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-auto"
            >
              Clear filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* COMPLAINTS CONTENT: DESKTOP TABLE vs MOBILE STACKED CARDS */}
      {loading ? (
        <div className="p-12 bg-white dark:bg-[#0D1B2A] rounded-2xl border border-slate-200 dark:border-[#23364D] flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3">Loading complaint records...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 bg-white dark:bg-[#0D1B2A] rounded-2xl border border-slate-200 dark:border-[#23364D] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#13263A] flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No complaints found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No complaints match the current filter or search criteria. Try modifying your filters or searching for different terms.
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 1. MOBILE RESPONSIVE CARDS (Visible on < 768px) */}
          <div className="md:hidden space-y-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t.id)}
                className="bg-white dark:bg-[#0D1B2A] p-4 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer space-y-3"
              >
                {/* Card Top: ID + Status + Urgency */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#13263A] px-2.5 py-1 rounded-md">
                      #{t.id}
                    </span>
                    {getStatusBadge(t.status)}
                  </div>
                  {getUrgencyBadge(t.urgency_level, t.urgency_score)}
                </div>

                {/* Subject & Complaint Snippet */}
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{t.subject}</h4>
                </div>

                {/* Tags & Metadata */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#23364D] text-xs">
                  <span className="font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800">
                    {t.category || 'General'}
                  </span>
                  {t.intent && (
                    <span className="font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#13263A] px-2 py-0.5 rounded">
                      Intent: {t.intent}
                    </span>
                  )}
                  {getSentimentPill(t.sentiment)}
                </div>

                {/* Card Footer: Customer & Action Target */}
                <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium truncate max-w-[140px]">{t.customer_name || 'Customer'}</span>
                  </div>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 min-h-[44px]">
                    View Complaint <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 2. DESKTOP 8-COLUMN DATA TABLE (Visible on >= 768px) */}
          <div className="hidden md:block bg-white dark:bg-[#0D1B2A] rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200 border-collapse">
                <thead className="bg-slate-50 dark:bg-[#13263A] border-b border-slate-200 dark:border-[#23364D] text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Ticket</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Issue Topic</th>
                    <th className="py-3.5 px-4">Customer Intent</th>
                    <th className="py-3.5 px-4">Sentiment</th>
                    <th className="py-3.5 px-4">Urgency</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23364D]">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket.id)}
                      className="hover:bg-blue-50/40 dark:hover:bg-[#13263A]/70 transition-colors cursor-pointer"
                    >
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900 dark:text-white whitespace-nowrap">
                        #{ticket.id}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 dark:text-white block">{ticket.customer_name}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-400">{ticket.customer_email || 'Web Portal'}</span>
                      </td>

                      {/* Category Topic */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 whitespace-nowrap">
                          {ticket.category}
                        </span>
                      </td>

                      {/* Intent */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {ticket.intent || '—'}
                      </td>

                      {/* Sentiment & Tone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getSentimentPill(ticket.sentiment)}
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getUrgencyBadge(ticket.urgency_level, ticket.urgency_score)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTicket(ticket.id);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#23364D] hover:bg-[#0F2A5F] hover:text-white dark:hover:bg-blue-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MOBILE FILTER MODAL / DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#0D1B2A] rounded-t-2xl p-6 shadow-modal border-t border-slate-200 dark:border-[#23364D] max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#23364D]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filter Complaints</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Fields */}
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Issue Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] rounded-xl px-3.5 py-3 text-slate-800 dark:text-white min-h-[44px]"
                >
                  <option value="">All Categories</option>
                  <option value="Delivery & Logistics">Delivery & Logistics</option>
                  <option value="Billing & Refund">Billing & Refund</option>
                  <option value="Product Defect">Product Defect</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Account & Login">Account & Login</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Customer Intent</label>
                <select
                  value={intentFilter}
                  onChange={(e) => setIntentFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] rounded-xl px-3.5 py-3 text-slate-800 dark:text-white min-h-[44px]"
                >
                  <option value="">All Intents</option>
                  <option value="Request Refund">Request Refund</option>
                  <option value="Request Replacement">Request Replacement</option>
                  <option value="Track Order">Track Order</option>
                  <option value="Cancel Order">Cancel Order</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Urgency Level</label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] rounded-xl px-3.5 py-3 text-slate-800 dark:text-white min-h-[44px]"
                >
                  <option value="">All Urgencies</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] rounded-xl px-3.5 py-3 text-slate-800 dark:text-white min-h-[44px]"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#23364D] flex gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-[#13263A] min-h-[44px] cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#0F2A5F] dark:bg-blue-600 text-white text-sm font-semibold hover:bg-[#163A7A] min-h-[44px] cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Ingestion Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        activeWorkspace={activeWorkspace}
        onImportCompleted={() => {
          setIsImportModalOpen(false);
          loadTickets();
        }}
      />
    </div>
  );
};
