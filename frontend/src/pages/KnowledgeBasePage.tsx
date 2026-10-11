import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Trash2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  X,
  FileCheck
} from 'lucide-react';
import { fetchApi, Workspace, KnowledgeGapItem } from '../api/client';

interface KnowledgeBasePageProps {
  activeWorkspace: Workspace;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({
  activeWorkspace,
}) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [gaps, setGaps] = useState<KnowledgeGapItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Document Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Standard Operating Procedure');
  const [newContent, setNewContent] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadKnowledgeData();
  }, [activeWorkspace.id]);

  const loadKnowledgeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [docsRes, gapsRes] = await Promise.all([
        fetchApi<any[]>(`/knowledge?workspace_id=${activeWorkspace.id}`),
        fetchApi<any>(`/knowledge/gaps?workspace_id=${activeWorkspace.id}`),
      ]);
      setDocs(docsRes);
      setGaps(gapsRes.gaps || []);
      if (docsRes.length > 0 && !selectedDoc) {
        setSelectedDoc(docsRes[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load knowledge documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Title and content are required.');
      return;
    }

    try {
      setUploading(true);
      await fetchApi('/knowledge', {
        method: 'POST',
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          title: newTitle,
          category: newCategory,
          content: newContent,
        }),
      });
      setIsAddOpen(false);
      setNewTitle('');
      setNewContent('');
      await loadKnowledgeData();
    } catch (err: any) {
      alert(err.message || 'Failed to save document');
    } finally {
      setUploading(false);
    }
  };

  const handleDraftFromGap = (gap: KnowledgeGapItem) => {
    setNewTitle(gap.suggested_policy_title);
    setNewCategory('Standard Operating Procedure');
    setNewContent(
      `# ${gap.suggested_policy_title}\n\n` +
      `Category: ${gap.dominant_category}\n` +
      `SLA Resolution Target: 24 Hours\n\n` +
      `1. Operational Policy:\n- State formal handling protocols for ${gap.cluster_title}.\n\n` +
      `2. Eligibility & Thresholds:\n- Outline compensation, returns, and escalation parameters.\n\n` +
      `3. Customer Communication Directive:\n- Acknowledge issue with empathy and provide verified tracking updates.`
    );
    setIsAddOpen(true);
  };

  const filteredDocs = searchQuery.trim()
    ? docs.filter((d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : docs;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#23364D]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Knowledge Base & SOPs
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Local Policy Grounding
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Internal operating procedures and policies used by the Response Assistant to ground generated resolution drafts.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTitle('');
            setNewContent('');
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold shadow-subtle transition cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Policy SOP</span>
        </button>
      </div>

      {/* KNOWLEDGE GAP DETECTION BANNER / SECTION */}
      {gaps.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-600/50 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">
                  Detected Knowledge Gaps ({gaps.length} Found)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Recurring complaint clusters that lack corresponding internal SOP documentation
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/60 px-3 py-1 rounded-full">
              SOP Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {gaps.map((gap) => (
              <div
                key={gap.cluster_id}
                className="bg-white dark:bg-[#0D1B2A] p-5 rounded-xl border border-amber-200 dark:border-[#23364D] shadow-subtle space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{gap.cluster_title}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                      {gap.complaint_count} complaints
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {gap.actionable_guidance}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-2">
                    Closest existing policy: <span className="font-semibold text-slate-700 dark:text-slate-200">{gap.closest_policy}</span>{' '}
                    (Match: {Math.round(gap.max_kb_similarity * 100)}%)
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#23364D] flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 truncate max-w-[200px]">
                    SOP: {gap.suggested_policy_title}
                  </span>
                  <button
                    onClick={() => handleDraftFromGap(gap)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 cursor-pointer min-h-[38px] px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-[#13263A]"
                  >
                    <span>Draft SOP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Touch-Friendly Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search policy documentation using TF-IDF cosine semantic similarity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#0D1B2A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[46px] shadow-subtle"
        />
      </div>

      {/* 2-Column Document Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0D1B2A] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-2 py-1 flex items-center justify-between">
            <span>Documents ({filteredDocs.length})</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Local TXT</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.filename === doc.filename;
              return (
                <div
                  key={doc.filename}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl cursor-pointer transition text-sm flex items-center justify-between min-h-[44px] ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-[#13263A] border border-blue-200 dark:border-blue-500/40 text-blue-900 dark:text-blue-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-[#13263A]/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono shrink-0">
                    {doc.category?.substring(0, 10)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0D1B2A] p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card min-h-[500px] flex flex-col justify-between">
          {selectedDoc ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-[#23364D]">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedDoc.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Category: {selectedDoc.category}</span>
                    <span>•</span>
                    <span className="font-mono">{selectedDoc.filename}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Indexed & Active
                </span>
              </div>

              {/* Policy Body */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#13263A] border border-slate-100 dark:border-[#23364D] text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-[420px] overflow-y-auto">
                {selectedDoc.content}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 text-sm">Select a document to inspect full policy text.</div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#23364D] flex items-center justify-between text-xs text-slate-400">
            <span>TF-IDF indexing ensures instant offline search retrieval.</span>
            <span>Local file: {selectedDoc?.filename}</span>
          </div>
        </div>
      </div>

      {/* ================= ADD POLICY MODAL ================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl p-6 max-w-lg w-full shadow-modal border border-slate-200 dark:border-[#23364D] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#23364D]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Internal Policy SOP</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3.5 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Policy Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Expedited Refund & Transit Guarantee"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm min-h-[44px]"
                >
                  <option value="Standard Operating Procedure">Standard Operating Procedure</option>
                  <option value="Refund & Return Policy">Refund & Return Policy</option>
                  <option value="Service Level Agreement">Service Level Agreement</option>
                  <option value="Technical Troubleshooting">Technical Troubleshooting</option>
                  <option value="Account Security Protocol">Account Security Protocol</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Policy Content (Markdown / Plain Text)</label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Document SLA targets, escalation thresholds, and communication directives..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 text-sm font-bold bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl shadow-subtle cursor-pointer min-h-[44px]"
                >
                  {uploading ? 'Indexing...' : 'Save & Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
