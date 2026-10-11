import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Clock,
  Send,
  Loader2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Edit3,
  X,
  FileText,
  User,
  Sparkles,
  Flame,
  CheckCircle,
  AlertCircle,
  ListChecks,
  CheckSquare,
  Square,
  Workflow,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { fetchApi, TicketDetail, Workspace, ResponseQualityCheck } from '../api/client';

interface ComplaintDetailPageProps {
  ticketId: string;
  activeWorkspace: Workspace;
  onBack: () => void;
  onSelectTicket: (ticketId: string) => void;
}

const LIFECYCLE_STAGES = [
  { key: 'ingested', label: 'Ingested', desc: 'Sanitized & queued' },
  { key: 'analyzed', label: 'NLP Analyzed', desc: 'Intent & entities extracted' },
  { key: 'routed', label: 'Auto-Routed', desc: 'Department assigned' },
  { key: 'drafted', label: 'Draft Generated', desc: 'Policy-grounded' },
  { key: 'review', label: 'Human Review', desc: 'Agent verification' },
  { key: 'resolved', label: 'Resolved', desc: 'Resolution delivered' },
];

const PLAYBOOKS_BY_CATEGORY: Record<string, { title: string; steps: string[] }> = {
  'Delivery & Logistics': {
    title: 'Logistics Incident SOP Playbook',
    steps: [
      'Audit carrier tracking telemetry & scan history via carrier API',
      'Cross-reference Mumbai / hub sorting transit delay threshold',
      'Confirm delivery address accuracy & customer contact window',
      'Issue carrier SLA penalty claim / dispatch replacement unit',
      'Transmit proactive ETA notification to customer with apology token',
    ],
  },
  'Billing & Refund': {
    title: 'Financial Dispute Resolution Playbook',
    steps: [
      'Verify transaction ID & payment gateway status webhook',
      'Cross-check payment ledger for duplicate capture / erroneous billing',
      'Check refund policy threshold ($100 instant reversal threshold)',
      'Authorize refund credit or voucher issuance in billing ledger',
      'Issue formal transaction receipt and closing notification',
    ],
  },
  'Product Defect': {
    title: 'Hardware & Product Defect SOP Playbook',
    steps: [
      'Inspect product batch code, warranty eligibility & purchase invoice',
      'Cross-reference known defect registry & engineering bug tracker',
      'Issue prepaid Return Merchandise Authorization (RMA) label',
      'Dispatch replacement inventory from regional warehouse',
      'Log defective batch telemetry in Quality Assurance portal',
    ],
  },
  'Technical Support': {
    title: 'Technical Triage & Service Playbook',
    steps: [
      'Collect diagnostic client logs, device OS & app version metadata',
      'Query Knowledge Base for active service outages & workarounds',
      'Reproduce issue and verify credentials / session tokens',
      'Apply configuration patch or escalate to Tier-2 Engineering',
      'Verify customer issue resolution with confirmation test',
    ],
  },
};

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({
  ticketId,
  activeWorkspace,
  onBack,
  onSelectTicket,
}) => {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Response generation & tone state
  const [selectedTone, setSelectedTone] = useState<string>('Professional');
  const [editableResponse, setEditableResponse] = useState('');
  const [qualityCheck, setQualityCheck] = useState<ResponseQualityCheck | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toneLoading, setToneLoading] = useState(false);

  // Modals
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [correctedCategory, setCorrectedCategory] = useState('');
  const [correctedIntent, setCorrectedIntent] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Interactive Playbook State
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({ 0: true });

  // Preprocessing tab
  const [prepTab, setPrepTab] = useState<'tokens' | 'lemmatized' | 'raw'>('lemmatized');

  useEffect(() => {
    loadTicketDetail();
  }, [ticketId]);

  const loadTicketDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi<TicketDetail>(`/tickets/${ticketId}`);
      setTicket(data);
      setEditableResponse(data.response_draft?.edited_text || data.response_draft?.draft_text || '');
      setQualityCheck(data.quality_check || null);
      setCorrectedCategory(data.category || '');
      setCorrectedIntent(data.intent || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket detail');
    } finally {
      setLoading(false);
    }
  };

  const handleToneChange = async (tone: string) => {
    setSelectedTone(tone);
    try {
      setToneLoading(true);
      const res = await fetchApi<any>(`/tickets/${ticketId}/generate-response`, {
        method: 'POST',
        body: JSON.stringify({ tone }),
      });
      setEditableResponse(res.draft_text);
      if (res.quality_check) {
        setQualityCheck(res.quality_check);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToneLoading(false);
    }
  };

  const handleApproveResponse = async () => {
    try {
      setActionLoading(true);
      await fetchApi(`/tickets/${ticketId}/approve-response`, {
        method: 'POST',
        body: JSON.stringify({ edited_text: editableResponse }),
      });
      await loadTicketDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to approve response');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(editableResponse);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResolveTicket = async () => {
    try {
      setActionLoading(true);
      await fetchApi(`/tickets/${ticketId}/resolve`, { method: 'POST' });
      await loadTicketDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalateTicket = async () => {
    if (!escalationReason.trim()) {
      alert('Please specify an escalation reason.');
      return;
    }
    try {
      setActionLoading(true);
      await fetchApi(`/tickets/${ticketId}/escalate`, {
        method: 'POST',
        body: JSON.stringify({ reason: escalationReason }),
      });
      setEscalateModalOpen(false);
      setEscalationReason('');
      await loadTicketDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to escalate ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFeedbackSubmitting(true);
      await fetchApi(`/tickets/${ticketId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          corrected_category: correctedCategory !== ticket?.category ? correctedCategory : undefined,
          corrected_intent: correctedIntent !== ticket?.intent ? correctedIntent : undefined,
          notes: feedbackNotes || undefined,
        }),
      });
      setFeedbackModalOpen(false);
      setFeedbackNotes('');
      await loadTicketDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to record feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleDepartmentChange = async (newDept: string) => {
    try {
      await fetchApi(`/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ assigned_department: newDept }),
      });
      await loadTicketDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to update department');
    }
  };

  const togglePlaybookStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Helper calculations for SLA
  const getSlaTargetHours = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 4;
      case 'high': return 12;
      case 'medium': return 24;
      case 'low': return 48;
      default: return 24;
    }
  };

  const getSlaDetails = () => {
    const targetHours = getSlaTargetHours(ticket?.urgency_level);
    const createdTime = ticket?.created_at ? new Date(ticket.created_at).getTime() : Date.now() - 3600000 * 3;
    const now = Date.now();
    const elapsedHours = Math.max(0.1, (now - createdTime) / (1000 * 60 * 60));
    const remainingHours = targetHours - elapsedHours;
    const isBreached = remainingHours <= 0;
    const percent = Math.min(100, Math.round((elapsedHours / targetHours) * 100));

    return {
      targetHours,
      elapsedHours: Math.round(elapsedHours * 10) / 10,
      remainingHours: Math.round(Math.abs(remainingHours) * 10) / 10,
      isBreached,
      percent,
    };
  };

  // Current stage in lifecycle
  const getLifecycleStageIndex = () => {
    if (!ticket) return 0;
    if (ticket.status === 'resolved') return 5;
    if (ticket.status === 'escalated') return 4;
    if (ticket.response_draft?.is_approved) return 4;
    if (ticket.response_draft) return 3;
    return 2;
  };

  if (loading) {
    return (
      <div className="p-16 max-w-7xl mx-auto text-center space-y-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Assembling complaint dossier & similarity metrics...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-4">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to complaints
        </button>
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm">
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  const dup = ticket.duplicate_warning;
  const sla = getSlaDetails();
  const currentStageIdx = getLifecycleStageIndex();
  const playbook = PLAYBOOKS_BY_CATEGORY[ticket.category || ''] || {
    title: 'Standard Grievance Resolution Playbook',
    steps: [
      'Validate customer identity and historical ticket context',
      'Perform NLP intent and emotional escalation verification',
      'Confirm grounded policy coverage with Knowledge Base',
      'Review and refine AI-suggested response draft',
      'Transmit formal response and mark resolution status',
    ],
  };
  const totalPlaybookSteps = playbook.steps.length;
  const completedPlaybookCount = playbook.steps.filter((_, idx) => !!completedSteps[idx]).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#23364D]">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#0D1B2A] hover:bg-slate-50 dark:hover:bg-[#13263A] text-slate-600 dark:text-slate-300 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Back to complaints list"
            aria-label="Back to complaints list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#13263A] px-2.5 py-1 rounded-md">
                #{ticket.id}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                  ticket.status === 'resolved'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : ticket.status === 'escalated'
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-slate-100 dark:bg-[#13263A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#23364D]'
                }`}
              >
                {ticket.status}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-400">
                Created {ticket.created_at ? ticket.created_at.slice(0, 16).replace('T', ' ') : ''}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{ticket.subject}</h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Provide Feedback Button */}
          <button
            onClick={() => setFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#0D1B2A] hover:bg-slate-50 dark:hover:bg-[#13263A] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-subtle transition cursor-pointer min-h-[42px]"
          >
            <Edit3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Correct Classification</span>
          </button>

          {/* Escalate Button */}
          {ticket.status !== 'escalated' && ticket.status !== 'resolved' && (
            <button
              onClick={() => setEscalateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[42px]"
            >
              Escalate
            </button>
          )}

          {/* Mark Resolved Button */}
          {ticket.status !== 'resolved' && (
            <button
              onClick={handleResolveTicket}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-subtle transition cursor-pointer min-h-[42px]"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Duplicate Warning Banner (if similarity >= 82%) */}
      {dup && dup.is_duplicate && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-600/60 rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Duplicate Complaint Alert
                </span>
                <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/60 px-2 py-0.5 rounded font-mono">
                  {dup.similarity_percentage}% Match
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                This grievance strongly mirrors ticket{' '}
                <span className="font-mono font-bold text-slate-900 dark:text-white">#{dup.matched_ticket_id}</span> submitted by{' '}
                <span className="font-bold text-slate-900 dark:text-white">{dup.matched_customer_name}</span> on{' '}
                <span>{dup.matched_created_at?.slice(0, 10)}</span>.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTicket(dup.matched_ticket_id)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer min-h-[44px]"
          >
            <span>View Parent Complaint</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= COMPLAINT SLA TRACKER CARD ================= */}
      <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#23364D]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${sla.isBreached && ticket.status !== 'resolved' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">SLA Resolution Tracker</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  ticket.status === 'resolved'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : sla.isBreached
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}>
                  {ticket.status === 'resolved' ? 'Resolved in SLA' : sla.isBreached ? 'SLA Breached' : 'Within SLA Target'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target resolution window calibrated to {ticket.urgency_level?.toUpperCase() || 'HIGH'} severity
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">SLA Target</span>
              <span className="text-slate-900 dark:text-white font-bold text-sm">{sla.targetHours} Hours</span>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-[#23364D]" />
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Elapsed Time</span>
              <span className="text-slate-900 dark:text-white font-bold text-sm">{sla.elapsedHours}h</span>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-[#23364D]" />
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">{sla.isBreached ? 'Overdue By' : 'Remaining'}</span>
              <span className={`font-bold text-sm ${sla.isBreached && ticket.status !== 'resolved' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {ticket.status === 'resolved' ? 'Closed' : `${sla.remainingHours}h`}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="pt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>SLA Progression: {sla.percent}% of {sla.targetHours}h allocation</span>
            <span>{ticket.status === 'resolved' ? '100% completed' : sla.isBreached ? 'Breached resolution threshold' : `${sla.remainingHours}h until escalation`}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-[#13263A] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ticket.status === 'resolved'
                  ? 'bg-blue-600'
                  : sla.isBreached
                  ? 'bg-rose-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${ticket.status === 'resolved' ? 100 : sla.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================= COMPLAINT LIFECYCLE TIMELINE ================= */}
      <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Complaint Lifecycle Timeline</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Stage {currentStageIdx + 1} of {LIFECYCLE_STAGES.length}
          </span>
        </div>

        {/* Responsive Step Line */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx || (idx === 5 && ticket.status === 'resolved');
            const isCurrent = idx === currentStageIdx && ticket.status !== 'resolved';

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'bg-white dark:bg-[#13263A] border-blue-200 dark:border-blue-900/50'
                    : 'bg-slate-50 dark:bg-[#0D1B2A] border-slate-100 dark:border-[#23364D] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-200 dark:bg-[#23364D] text-slate-600 dark:text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isCurrent ? 'text-blue-700 dark:text-blue-400' : isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`}>
                    {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{stage.label}</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 leading-snug">{stage.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Column Dossier Layout (Desktop) vs Responsive Stack (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= COLUMN 1: Customer Message & NLP Understanding ================= */}
        <div className="space-y-6">
          {/* Customer Grievance Card */}
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ticket.customer_name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400">{ticket.customer_email || 'No email provided'}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">{ticket.customer_email || 'web portal'}</span>
            </div>

            {/* Original Complaint Text */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#13263A] border border-slate-100 dark:border-[#23364D]">
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                "{ticket.message}"
              </p>
            </div>

            {/* Preprocessing Inspector Tabs */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#23364D]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">NLP Preprocessing</span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#13263A] p-0.5 rounded-lg text-xs">
                  {(['lemmatized', 'tokens', 'raw'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPrepTab(tab)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer capitalize ${
                        prepTab === tab
                          ? 'bg-white dark:bg-[#0D1B2A] text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#13263A] rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto">
                {prepTab === 'lemmatized' && (ticket.lemmatized_text || 'Lemmatized terms processed')}
                {prepTab === 'tokens' && (
                  <div className="flex flex-wrap gap-1">
                    {(ticket.preprocessed_tokens || []).map((tok: string, idx: number) => (
                      <span key={idx} className="bg-slate-200 dark:bg-[#0D1B2A] px-1.5 py-0.5 rounded text-[11px]">
                        {tok}
                      </span>
                    ))}
                  </div>
                )}
                {prepTab === 'raw' && ticket.message}
              </div>
            </div>
          </div>

          {/* What ComplaintSense Understood */}
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>What ComplaintSense Understood</span>
            </h3>

            <div className="space-y-3.5 text-sm">
              {/* Category Topic */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#23364D]">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Issue Topic</span>
                <span className="font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 text-xs">
                  {ticket.category}
                </span>
              </div>

              {/* Customer Intent (Topic vs Intent) */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#23364D]">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Customer Intent</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#13263A] px-3 py-1 rounded-full text-xs">
                  {ticket.intent || 'General Query'}
                </span>
              </div>

              {/* Emotional Tone & Sentiment */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#23364D]">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Customer Sentiment</span>
                <div className="text-right">
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-xs block">
                    {ticket.sentiment?.toUpperCase()}
                  </span>
                  {ticket.sentiment_score !== undefined && (
                    <span className="text-[11px] text-slate-400">Score: {ticket.sentiment_score}</span>
                  )}
                </div>
              </div>

              {/* Urgency Score & Signals */}
              <div className="pb-2 border-b border-slate-100 dark:border-[#23364D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Urgency Score</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {ticket.urgency_score || 70}/100 ({ticket.urgency_level?.toUpperCase() || 'HIGH'})
                  </span>
                </div>
                {ticket.urgency_signals && ticket.urgency_signals.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ticket.urgency_signals.map((sig, idx: number) => (
                      <span key={idx} className="text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800" title={sig.description}>
                        {sig.keyword || sig.type}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Named Entities Extracted */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Named Entities Extracted</span>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.entities && ticket.entities.length > 0 ? (
                    ticket.entities.map((ent, idx: number) => (
                      <span key={idx} className="text-xs font-semibold bg-slate-100 dark:bg-[#13263A] text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#23364D]">
                        <span className="text-slate-400 text-[10px] mr-1">{ent.entity_type}:</span>
                        {ent.entity_text}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No specific entities detected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: Resolution Playbook & Similar Complaints ================= */}
        <div className="space-y-6">
          {/* Interactive Complaint Resolution Playbook Card */}
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Resolution Playbook</h3>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                completedPlaybookCount === totalPlaybookSteps
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-[#13263A] text-slate-700 dark:text-slate-300'
              }`}>
                {completedPlaybookCount}/{totalPlaybookSteps} Completed
              </span>
            </div>

            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">{playbook.title}</span>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                Standard operating procedure verified for {ticket.category || 'General Complaints'}. Check off steps as you resolve this ticket.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2 pt-1">
              {playbook.steps.map((step, idx) => {
                const isChecked = !!completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => togglePlaybookStep(idx)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-[#13263A] border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A3048]'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0"
                      aria-label={isChecked ? 'Mark step incomplete' : 'Mark step complete'}
                    >
                      {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                    </button>
                    <span className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-400 dark:text-slate-400' : 'font-medium'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Similar Complaints List */}
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Similar Complaints</h3>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Top {ticket.similar_complaints?.length || 0} Matches
              </span>
            </div>

            <div className="space-y-3">
              {ticket.similar_complaints && ticket.similar_complaints.length > 0 ? (
                ticket.similar_complaints.map((sim) => (
                  <div
                    key={sim.ticket_id}
                    onClick={() => onSelectTicket(sim.ticket_id)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-[#23364D] hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-[#13263A] transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        #{sim.ticket_id}
                      </span>
                      <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                        {Math.round(sim.similarity_score * 100)}% match
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {sim.snippet || sim.subject}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No similar complaints found in workspace.</p>
              )}
            </div>
          </div>

          {/* Root-Cause & Complaint Intelligence */}
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Complaint Intelligence</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 bg-slate-50 dark:bg-[#13263A] rounded-xl border border-slate-100 dark:border-[#23364D] space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recurring Cluster</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">
                  {(ticket as any).cluster_name || 'Delivery Delays in Mumbai Cluster'}
                </span>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold block">
                  +35% growth in current 30-day window
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#13263A] rounded-xl border border-slate-100 dark:border-[#23364D] space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Associated Root-Cause Pattern</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Linguistic co-occurrence of <strong>SpeedFast Logistics</strong> shipments in <strong>Mumbai</strong> hub sorting.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-[#13263A] rounded-lg border border-slate-100 dark:border-[#23364D]">
                  <span className="text-slate-400 block font-semibold">Location</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Mumbai</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-[#13263A] rounded-lg border border-slate-100 dark:border-[#23364D]">
                  <span className="text-slate-400 block font-semibold">Logistics Partner</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">SpeedFast Logistics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: Resolution & Response Assistant ================= */}
        <div className="space-y-6">
          {/* Recommended Department & Grounded Policy */}
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recommended Action & Routing</h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                  Assigned Department
                </label>
                <select
                  value={ticket.assigned_department || 'Customer Support'}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold cursor-pointer min-h-[44px]"
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="Logistics & Delivery">Logistics & Delivery</option>
                  <option value="Billing & Finance">Billing & Finance</option>
                  <option value="Engineering & IT">Engineering & IT</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              {/* Policy Grounding */}
              {ticket.relevant_knowledge && ticket.relevant_knowledge.length > 0 && (
                <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Grounded in Policy: {ticket.relevant_knowledge[0].title}</span>
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    {ticket.relevant_knowledge[0].snippet || 'Corporate policy guarantees proactive transit audit and refund eligibility.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Response Assistant */}
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Response Assistant</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Human-in-the-Loop
              </span>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                Response Tone Style:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {['Professional', 'Empathetic', 'Concise', 'Formal'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => handleToneChange(tone)}
                    disabled={toneLoading}
                    className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[38px] ${
                      selectedTone === tone
                        ? 'bg-[#0F2A5F] dark:bg-blue-600 text-white shadow-subtle'
                        : 'bg-slate-50 dark:bg-[#13263A] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1B324B] border border-slate-200 dark:border-[#23364D]'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time Quality Checklist */}
            {qualityCheck && (
              <div className="p-3.5 bg-slate-50 dark:bg-[#13263A] rounded-xl border border-slate-200 dark:border-[#23364D] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Quality Checklist
                  </span>
                  <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    Score: {qualityCheck.score_pct}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {qualityCheck.checklist?.map((item) => (
                    <span
                      key={item.id}
                      className={`flex items-center gap-1 ${item.passed ? 'text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-400'}`}
                      title={item.detail}
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Editable Response Draft */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Response Draft (Editable)</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  NLP-generated draft — Human review required
                </span>
              </div>
              <textarea
                rows={6}
                value={editableResponse}
                onChange={(e) => setEditableResponse(e.target.value)}
                placeholder="Compose response to customer..."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#13263A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
              />
            </div>

            {/* Action Buttons: Copy, Approve, Regenerate */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={handleCopyResponse}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] hover:bg-slate-50 dark:hover:bg-[#13263A] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer min-h-[44px]"
              >
                {isCopied ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleApproveResponse}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-subtle transition cursor-pointer min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ESCALATION MODAL ================= */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl p-6 max-w-md w-full shadow-modal border border-slate-200 dark:border-[#23364D] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#23364D]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Escalate Complaint #{ticket.id}</h3>
              <button onClick={() => setEscalateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escalating flags this complaint for expedited leadership and legal/operations review.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Reason for Escalation</label>
              <textarea
                rows={3}
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="e.g. Legal threat issued, high financial loss, repeated delivery failure..."
                className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEscalateModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#13263A] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateTicket}
                disabled={actionLoading}
                className="px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-subtle cursor-pointer"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HUMAN FEEDBACK CORRECTION MODAL ================= */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl p-6 max-w-md w-full shadow-modal border border-slate-200 dark:border-[#23364D] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#23364D]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Correct Classification</h3>
              <button onClick={() => setFeedbackModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide human feedback corrections to log audit drift data and retrain NLP models.
            </p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Correct Category</label>
                <select
                  value={correctedCategory}
                  onChange={(e) => setCorrectedCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm"
                >
                  <option value="Delivery & Logistics">Delivery & Logistics</option>
                  <option value="Billing & Refund">Billing & Refund</option>
                  <option value="Product Defect">Product Defect</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Account & Login">Account & Login</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Contract & Legal">Contract & Legal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Correct Intent</label>
                <select
                  value={correctedIntent}
                  onChange={(e) => setCorrectedIntent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm"
                >
                  <option value="Request Refund">Request Refund</option>
                  <option value="Request Replacement">Request Replacement</option>
                  <option value="Track Order">Track Order</option>
                  <option value="Cancel Order">Cancel Order</option>
                  <option value="Report Payment Problem">Report Payment Problem</option>
                  <option value="Report Technical Problem">Report Technical Problem</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Audit Notes</label>
                <textarea
                  rows={3}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Explain why the prediction was adjusted..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-subtle cursor-pointer"
                >
                  {feedbackSubmitting ? 'Submitting...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
