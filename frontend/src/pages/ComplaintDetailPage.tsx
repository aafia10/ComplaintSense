import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Bot, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Building2, 
  ExternalLink, 
  Layers, 
  FileText, 
  HelpCircle,
  Tag,
  Clock,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { fetchApi, TicketDetail, Workspace } from '../api/client';

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

  // Editable response state
  const [editableResponse, setEditableResponse] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');

  // Active Preprocessing Inspection Tab
  const [prepTab, setPrepTab] = useState<'tokens' | 'stops' | 'lemmatized' | 'raw'>('lemmatized');

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
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket detail');
    } finally {
      setLoading(false);
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <div className="text-xs text-slate-500 font-medium">Loading complaint intelligence dossier...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to complaints
        </button>
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {ticket.id}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                ticket.status === 'escalated' ? 'bg-rose-100 text-rose-800' :
                ticket.status === 'in_progress' ? 'bg-sky-100 text-sky-800' :
                'bg-slate-100 text-slate-700'
              }`}>
                {ticket.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">
                Created {ticket.created_at ? ticket.created_at.slice(0, 16).replace('T', ' ') : ''}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              {ticket.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ticket.status !== 'escalated' && ticket.status !== 'resolved' && (
            <button
              onClick={() => setEscalateModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
            >
              Escalate
            </button>
          )}

          {ticket.status !== 'resolved' && (
            <button
              onClick={handleResolveTicket}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* 3-Column SaaS Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Customer & Complaint Context (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Customer Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer Profile
            </h3>
            <div>
              <div className="text-sm font-bold text-slate-900">{ticket.customer_name}</div>
              <div className="text-xs text-slate-500 font-mono">{ticket.customer_email}</div>
            </div>
            
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Workspace</span>
                <span className="font-semibold text-slate-700">{activeWorkspace.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Dept</span>
                <select
                  value={ticket.assigned_department || ticket.recommended_department || ''}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="mt-0.5 px-2 py-1 rounded border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  {activeWorkspace.departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {ticket.escalation_reason && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <span className="font-bold">Escalation Reason:</span> {ticket.escalation_reason}
              </div>
            )}
          </div>

          {/* Original Complaint Message */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Statement
              </h3>
              <span className="text-[11px] text-slate-400">Raw Input</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
              {ticket.message}
            </div>
          </div>

          {/* Academic Preprocessing Inspector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Preprocessing Inspection
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                NLP Pipeline
              </span>
            </div>

            {/* Tab buttons */}
            <div className="flex border-b border-slate-100 text-[11px] font-medium text-slate-500">
              <button
                onClick={() => setPrepTab('lemmatized')}
                className={`pb-1.5 px-2 border-b-2 transition ${prepTab === 'lemmatized' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent hover:text-slate-700'}`}
              >
                Lemmatized
              </button>
              <button
                onClick={() => setPrepTab('tokens')}
                className={`pb-1.5 px-2 border-b-2 transition ${prepTab === 'tokens' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent hover:text-slate-700'}`}
              >
                Tokens ({ticket.preprocessed_tokens?.length || 0})
              </button>
              <button
                onClick={() => setPrepTab('raw')}
                className={`pb-1.5 px-2 border-b-2 transition ${prepTab === 'raw' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent hover:text-slate-700'}`}
              >
                Cleaned
              </button>
            </div>

            {/* Tab contents */}
            <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] max-h-44 overflow-y-auto leading-relaxed">
              {prepTab === 'lemmatized' && (
                <div>{ticket.lemmatized_text || 'No lemmatized representation available.'}</div>
              )}
              {prepTab === 'tokens' && (
                <div className="flex flex-wrap gap-1">
                  {ticket.preprocessed_tokens && ticket.preprocessed_tokens.length > 0 ? (
                    ticket.preprocessed_tokens.map((tok, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                        "{tok}"
                      </span>
                    ))
                  ) : (
                    <span>No tokens found.</span>
                  )}
                </div>
              )}
              {prepTab === 'raw' && (
                <div>{ticket.subject}. {ticket.message}</div>
              )}
            </div>
          </div>

        </div>

        {/* MIDDLE COLUMN: Core NLP Understanding & Similar Complaints (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Intelligence Multi-Facet Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                NLP Understanding
              </h3>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Active Classifier
              </span>
            </div>

            {/* Topic vs Intent Differentiator */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Predicted Topic
                </span>
                <span className="text-xs font-extrabold text-slate-900">
                  {ticket.category || 'General Inquiry'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-500 block mb-0.5">
                  Detected Intent
                </span>
                <span className="text-xs font-extrabold text-indigo-700">
                  {ticket.intent || 'Report Problem'}
                </span>
              </div>
            </div>

            {/* Sentiment & Tone */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Customer Sentiment:</span>
                <span className={`font-bold ${
                  ticket.sentiment === 'Negative' ? 'text-rose-600' :
                  ticket.sentiment === 'Positive' ? 'text-emerald-600' :
                  'text-slate-600'
                }`}>
                  {ticket.sentiment} (Compound: {ticket.sentiment_score ?? 0.0})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Emotional Tone:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {ticket.emotional_tone || 'Neutral'}
                </span>
              </div>
            </div>

            {/* Urgency Scoring Engine */}
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                    Urgency Engine
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    Tier: {ticket.urgency_level}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-rose-600">
                    {ticket.urgency_score ?? 15}
                  </span>
                  <span className="text-[10px] text-slate-400"> / 100</span>
                </div>
              </div>

              {/* Detected Urgency Signals */}
              {ticket.urgency_signals && ticket.urgency_signals.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    Triggered Signals:
                  </span>
                  {ticket.urgency_signals.map((sig, sIdx) => (
                    <div key={sIdx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 font-semibold text-[10px]">
                        {sig.type}
                      </span>
                      <span>
                        keyword <span className="font-bold text-slate-900">"{sig.keyword}"</span> - {sig.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Named Entity Recognition (NER) */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Extracted Named Entities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ticket.entities && ticket.entities.length > 0 ? (
                  ticket.entities.map((ent, eIdx) => (
                    <span 
                      key={eIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      <span className="text-[9px] font-bold text-indigo-600 uppercase">
                        {ent.entity_type}:
                      </span>
                      <span>{ent.entity_text}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No domain entities extracted.</span>
                )}
              </div>
            </div>

          </div>

          {/* Similar Complaints Module */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Similar Complaints ({ticket.similar_complaints?.length || 0})
              </h3>
              <span className="text-[10px] text-slate-400">TF-IDF Cosine Match</span>
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
                        <span className="font-mono text-[10px] font-bold text-slate-700">
                          {sim.ticket_id}
                        </span>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">
                          {Math.round(sim.similarity_score * 100)}% match
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-medium group-hover:text-indigo-600 transition truncate max-w-[220px]">
                        {sim.subject}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 flex-shrink-0" />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No similar complaints in workspace with similarity &gt; 15%.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Resolution & Response Generator (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Operational Recommendation & Root Cause Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recommended Action
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                Human Override Allowed
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Suggested Department
              </span>
              <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded inline-block">
                {ticket.recommended_department || 'Customer Support'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Prescribed Next Step
              </span>
              <div className="text-xs text-slate-800 font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                {ticket.recommended_action || 'Review and respond to customer request.'}
              </div>
            </div>
          </div>

          {/* Retrieved Knowledge Base Documents */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Retrieved Policy Knowledge
              </h3>
              <span className="text-[10px] text-slate-400">Local Vectorization</span>
            </div>

            <div className="space-y-2.5">
              {ticket.relevant_knowledge && ticket.relevant_knowledge.length > 0 ? (
                ticket.relevant_knowledge.map((doc, dIdx) => (
                  <div key={dIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{doc.title}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {Math.round(doc.similarity * 100)}% relevance
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                      "{doc.snippet}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching policy documents retrieved.
                </div>
              )}
            </div>
          </div>

          {/* NLP Generated Draft Response */}
          <div className="bg-white p-5 rounded-2xl border-2 border-indigo-500/80 shadow-lg shadow-indigo-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">
                  NLP Response Assistant
                </h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Human Review Required
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Synthesized from customer tone, urgency SLA, and retrieved policy rules. Review, edit, and approve before communicating.
            </p>

            <textarea
              rows={8}
              value={editableResponse}
              onChange={(e) => setEditableResponse(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            {ticket.response_draft?.is_approved && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Response approved by support agent</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={handleCopyResponse}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleApproveResponse}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Draft</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Escalate Modal */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Escalate Complaint</h3>
            <p className="text-xs text-slate-500">
              State the operational or legal justification for elevating priority to critical tier.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Threat of Consumer Court litigation regarding persistent Mumbai shipment delay..."
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
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
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
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
