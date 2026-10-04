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
  X
} from 'lucide-react';
import { fetchApi, TicketDetail, Workspace, ResponseQualityCheck } from '../api/client';

interface ComplaintDetailPageProps {
  ticketId: string;
  activeWorkspace: Workspace;
  onBack: () => void;
  onSelectTicket: (ticketId: string) => void;
}

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

  if (loading) {
    return (
      <div className="p-16 max-w-7xl mx-auto text-center">
        <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Assembling complaint dossier & similarity metrics...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <button onClick={onBack} className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to complaints
        </button>
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  const dup = ticket.duplicate_warning;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Back to complaints list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {ticket.id}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  ticket.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : ticket.status === 'escalated'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {ticket.status.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-400">
                Created {ticket.created_at ? ticket.created_at.slice(0, 16).replace('T', ' ') : ''}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 mt-1">{ticket.subject}</h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Provide Feedback Button */}
          <button
            onClick={() => setFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Correct Classification</span>
          </button>

          {/* Escalate button */}
          {ticket.status !== 'escalated' && ticket.status !== 'resolved' && (
            <button
              onClick={() => setEscalateModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
            >
              Escalate
            </button>
          )}

          {/* Mark Resolved */}
          {ticket.status !== 'resolved' && (
            <button
              onClick={handleResolveTicket}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Duplicate Warning Banner (if similarity >= 82%) */}
      {dup && dup.is_duplicate && (
        <div className="bg-amber-50 border-2 border-amber-300/80 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Duplicate Complaint Alert
                </span>
                <span className="text-xs font-extrabold text-amber-800 bg-amber-200/70 px-1.5 py-0.2 rounded font-mono">
                  {dup.similarity_percentage}% Match
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                This grievance strongly mirrors ticket{' '}
                <span className="font-mono font-bold text-slate-900">#{dup.matched_ticket_id}</span> submitted by{' '}
                <span className="font-semibold text-slate-900">{dup.matched_customer_name}</span> on{' '}
                {dup.matched_created_at.slice(0, 10)}.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 italic max-w-2xl line-clamp-1">
                "{dup.matched_snippet}"
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTicket(dup.matched_ticket_id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-xs font-semibold text-amber-900 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <span>View Ticket #{dup.matched_ticket_id}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3-Column SaaS Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Customer & Complaint Statement (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Profile */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Customer Information
            </span>
            <div>
              <div className="text-sm font-bold text-slate-900">{ticket.customer_name}</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{ticket.customer_email}</div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Workspace</span>
                <span className="font-semibold text-slate-700">{activeWorkspace.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Unit</span>
                <select
                  value={ticket.assigned_department || ticket.recommended_department || ''}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="mt-0.5 px-2 py-1 rounded border border-slate-200 text-xs font-semibold text-slate-800 bg-white cursor-pointer"
                >
                  {activeWorkspace.departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {ticket.escalation_reason && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <span className="font-bold">Escalation Reason:</span> {ticket.escalation_reason}
              </div>
            )}
          </div>

          {/* Original Complaint Statement */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Customer Message
              </span>
              <span className="text-[10px] text-slate-400">Verbatim Input</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.message}
            </div>
          </div>

          {/* Academic Preprocessing Inspector */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Preprocessing Inspection
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                NLTK + Lemmatizer
              </span>
            </div>

            <div className="flex border-b border-slate-100 text-xs font-medium text-slate-500">
              <button
                onClick={() => setPrepTab('lemmatized')}
                className={`pb-1 px-2 border-b-2 transition cursor-pointer ${
                  prepTab === 'lemmatized'
                    ? 'border-emerald-700 text-emerald-800 font-bold'
                    : 'border-transparent hover:text-slate-700'
                }`}
              >
                Lemmatized
              </button>
              <button
                onClick={() => setPrepTab('tokens')}
                className={`pb-1 px-2 border-b-2 transition cursor-pointer ${
                  prepTab === 'tokens'
                    ? 'border-emerald-700 text-emerald-800 font-bold'
                    : 'border-transparent hover:text-slate-700'
                }`}
              >
                Tokens ({ticket.preprocessed_tokens?.length || 0})
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] max-h-36 overflow-y-auto leading-relaxed">
              {prepTab === 'lemmatized' && <div>{ticket.lemmatized_text || 'No lemmatized output.'}</div>}
              {prepTab === 'tokens' && (
                <div className="flex flex-wrap gap-1">
                  {ticket.preprocessed_tokens?.map((tok, i) => (
                    <span key={i} className="px-1 py-0.5 rounded bg-slate-800 text-emerald-300">
                      "{tok}"
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logged Human Feedback History */}
          {ticket.feedbacks && ticket.feedbacks.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Human Correction Log ({ticket.feedbacks.length})
              </span>
              <div className="space-y-2">
                {ticket.feedbacks.map((f) => (
                  <div key={f.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Correction #{f.id}</span>
                      <span>{f.created_at.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                    {f.corrected_category && (
                      <p className="text-slate-700">
                        Category: <span className="line-through text-slate-400">{f.original_category}</span>{' '}
                        <span className="font-semibold text-emerald-800">→ {f.corrected_category}</span>
                      </p>
                    )}
                    {f.notes && <p className="text-slate-500 italic text-[11px]">Note: "{f.notes}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: NLP Multi-Facet & Similar Complaints (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Multi-Facet NLP Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                NLP Intelligence Extraction
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                Pipeline Active
              </span>
            </div>

            {/* Topic vs Intent */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Topic</span>
                <span className="text-xs font-bold text-slate-900">{ticket.category || 'General'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">Intent</span>
                <span className="text-xs font-bold text-emerald-800">{ticket.intent || 'Report Problem'}</span>
              </div>
            </div>

            {/* Sentiment & Tone */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sentiment:</span>
                <span
                  className={`font-bold ${
                    ticket.sentiment === 'Negative'
                      ? 'text-rose-600'
                      : ticket.sentiment === 'Positive'
                      ? 'text-emerald-700'
                      : 'text-slate-700'
                  }`}
                >
                  {ticket.sentiment} (Compound: {ticket.sentiment_score ?? 0.0})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tone:</span>
                <span className="font-semibold text-slate-800">{ticket.emotional_tone || 'Neutral'}</span>
              </div>
            </div>

            {/* Urgency Scoring Engine */}
            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-900 block">Urgency Level</span>
                  <span className="text-xs font-bold text-slate-900">{ticket.urgency_level} Tier</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-rose-600">{ticket.urgency_score ?? 15}</span>
                  <span className="text-[10px] text-slate-400"> / 100</span>
                </div>
              </div>

              {ticket.urgency_signals && ticket.urgency_signals.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60 space-y-1">
                  <span className="text-[10px] font-semibold text-amber-900 uppercase block">Triggers Detected:</span>
                  {ticket.urgency_signals.map((sig, sIdx) => (
                    <div key={sIdx} className="text-[11px] text-slate-700 flex items-start gap-1">
                      <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 font-semibold text-[10px]">
                        {sig.type}
                      </span>
                      <span>"{sig.keyword}" - {sig.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted Entities */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Named Entities (NER)</span>
              <div className="flex flex-wrap gap-1.5">
                {ticket.entities && ticket.entities.length > 0 ? (
                  ticket.entities.map((ent, eIdx) => (
                    <span
                      key={eIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      <span className="text-[9px] font-bold text-emerald-800 uppercase">{ent.entity_type}:</span>
                      <span>{ent.entity_text}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No specific entities detected.</span>
                )}
              </div>
            </div>
          </div>

          {/* Similar Complaints Module */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Similar Complaints ({ticket.similar_complaints?.length || 0})
              </span>
              <span className="text-[10px] text-slate-400">TF-IDF Cosine</span>
            </div>

            <div className="divide-y divide-slate-100">
              {ticket.similar_complaints && ticket.similar_complaints.length > 0 ? (
                ticket.similar_complaints.map((sim, sIdx) => (
                  <div
                    key={sIdx}
                    onClick={() => onSelectTicket(sim.ticket_id)}
                    className="py-2.5 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[10px] font-bold text-slate-700">{sim.ticket_id}</span>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50">
                          {Math.round(sim.similarity_score * 100)}% match
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-medium group-hover:text-emerald-800 transition truncate max-w-[220px]">
                        {sim.subject}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-800 shrink-0" />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">No similar tickets found above threshold.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Draft Response, Tone Controller, & Quality Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Response Quality Checklist Card */}
          {qualityCheck && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-900">Response Quality Check</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    qualityCheck.is_ready_to_send
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {qualityCheck.score_pct}% Ready
                </span>
              </div>

              <div className="space-y-2">
                {qualityCheck.checklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5">
                      {item.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </span>
                    <div>
                      <span className={`font-semibold block ${item.passed ? 'text-slate-800' : 'text-amber-900'}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-500">{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Response Assistant with Tone Controller */}
          <div className="bg-white p-5 rounded-xl border-2 border-emerald-600/70 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">Response Generator</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                Human Review Required
              </span>
            </div>

            {/* Tone Selector Buttons */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Draft Tone Style:
              </label>
              <div className="grid grid-cols-4 gap-1">
                {['Professional', 'Empathetic', 'Concise', 'Formal'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => handleToneChange(tone)}
                    disabled={toneLoading}
                    className={`py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer text-center ${
                      selectedTone === tone
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Draft */}
            <div className="relative">
              {toneLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center rounded-lg z-10">
                  <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
                </div>
              )}
              <textarea
                rows={9}
                value={editableResponse}
                onChange={(e) => setEditableResponse(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 text-xs font-sans text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>

            {ticket.response_draft?.is_approved && (
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Response approved by agent</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={handleCopyResponse}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleApproveResponse}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Response</span>
              </button>
            </div>
          </div>

          {/* Retrieved Knowledge Base References */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Retrieved Policy Knowledge
            </span>
            <div className="space-y-2">
              {ticket.relevant_knowledge && ticket.relevant_knowledge.length > 0 ? (
                ticket.relevant_knowledge.map((doc, dIdx) => (
                  <div key={dIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{doc.title}</span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50">
                        {Math.round(doc.similarity * 100)}% match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic line-clamp-2">"{doc.snippet}"</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">No matching policy documents retrieved.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Human Feedback / Correction Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Correct Classification & Feedback</h3>
              <button onClick={() => setFeedbackModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Update the category or intent if the NLP model misclassified. This is logged to the continuous evaluation audit.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Correct Category / Topic</label>
                <select
                  value={correctedCategory}
                  onChange={(e) => setCorrectedCategory(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  {activeWorkspace.categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Correct Intent</label>
                <select
                  value={correctedIntent}
                  onChange={(e) => setCorrectedIntent(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
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
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Correction Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="e.g. Customer explicitly requested replacement not refund..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                >
                  {feedbackSubmitting ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Escalate Complaint to Tier-2</h3>
            <p className="text-xs text-slate-500">
              State the operational or legal justification for elevating priority to critical tier.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Legal escalation notice regarding recurring delayed consignment..."
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEscalateModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateTicket}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
