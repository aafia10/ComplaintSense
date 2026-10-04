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
  X
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

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('workspace_id', activeWorkspace.id);
      formData.append('title', newTitle.trim());
      formData.append('category', newCategory);
      formData.append('content_text', newContent.trim());

      const res = await fetch(`http://localhost:8000/api/knowledge`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create document');
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

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Are you sure you want to delete this custom policy?')) return;
    try {
      await fetchApi(`/knowledge/${id}`, { method: 'DELETE' });
      await loadKnowledgeData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Knowledge Base & SOP Policies
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50">
              100% Local Text Retrieval
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal guidelines and standard operating procedures used by the response assistant to ground customer drafts.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTitle('');
            setNewContent('');
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Policy SOP</span>
        </button>
      </div>

      {/* KNOWLEDGE GAP DETECTION BANNER / SECTION */}
      {gaps.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-300/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Knowledge Gap Detection ({gaps.length} Found)
                </h2>
                <p className="text-[11px] text-slate-600">
                  Customer complaint clusters that lack corresponding internal policy guidelines
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
              High Priority SOP Recommendations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {gaps.map((gap) => (
              <div
                key={gap.cluster_id}
                className="bg-white p-4 rounded-lg border border-amber-200 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{gap.cluster_title}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                      {gap.complaint_count} complaints
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{gap.actionable_guidance}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Closest existing policy: <span className="font-medium text-slate-700">{gap.closest_policy}</span>{' '}
                    (Match: {Math.round(gap.max_kb_similarity * 100)}%)
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-800">
                    Suggested SOP: {gap.suggested_policy_title}
                  </span>
                  <button
                    onClick={() => handleDraftFromGap(gap)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    <span>Draft Policy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search policy documentation using TF-IDF cosine semantic similarity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* 2-Column Document Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document List (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="text-[11px] font-bold uppercase text-slate-400 px-2 py-1 flex items-center justify-between">
            <span>Documents ({filteredDocs.length})</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Local TXT</span>
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.filename === doc.filename;
              return (
                <div
                  key={doc.filename}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-lg cursor-pointer transition text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border border-emerald-200/70 text-emerald-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  {doc.is_custom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Delete custom policy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          {selectedDoc ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedDoc.title}</h2>
                  <span className="text-xs text-slate-400 font-mono">{selectedDoc.filename}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedDoc.category || 'Policy Document'}
                </span>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto">
                {selectedDoc.content}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-slate-400">
              Select a document from the left to read its full policy terms.
            </div>
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Standard Operating Procedure (SOP)</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Operating Procedure: Delayed Shipments"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Policy Content (TXT format)</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Specify handling guidelines, compensation rules, and response turnaround..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                >
                  {uploading ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
