import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText, 
  Trash2, 
  Upload, 
  Check, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { fetchApi, Workspace } from '../api/client';

interface KnowledgeBasePageProps {
  activeWorkspace: Workspace;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({
  activeWorkspace,
}) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Document Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Policy');
  const [newContent, setNewContent] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [activeWorkspace.id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi<any[]>(`/knowledge?workspace_id=${activeWorkspace.id}`);
      setDocs(res);
      if (res.length > 0 && !selectedDoc) {
        setSelectedDoc(res[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load knowledge documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      setLoading(true);
      const res = await fetchApi<any[]>(`/knowledge/search?workspace_id=${activeWorkspace.id}&q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res);
    } catch (err: any) {
      alert(err.message || 'Search failed');
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

      const url = `http://localhost:8000/api/knowledge`;
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create document');
      setIsAddOpen(false);
      setNewTitle('');
      setNewContent('');
      await loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to save document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Are you sure you want to delete this custom document?')) return;
    try {
      await fetchApi(`/knowledge/${id}`, { method: 'DELETE' });
      await loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeWorkspace.name} Local Knowledge Base
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Local TXT policy documents referenced by the retrieval engine to ground automated response suggestions.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Policy TXT</span>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search policy guidelines using local TF-IDF semantic vector search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
        >
          Search Knowledge
        </button>
        {searchResults && (
          <button
            type="button"
            onClick={() => {
              setSearchResults(null);
              setSearchQuery('');
            }}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:underline"
          >
            Clear
          </button>
        )}
      </form>

      {/* 2-Column Document Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Document List (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold uppercase text-slate-400 px-2 py-1 flex items-center justify-between">
            <span>Documents ({docs.length})</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Local Storage</span>
          </div>

          <div className="space-y-1 max-h-[550px] overflow-y-auto">
            {docs.map((doc) => {
              const isSelected = selectedDoc?.filename === doc.filename;
              return (
                <div
                  key={doc.filename}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-xl cursor-pointer transition text-xs flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <FileText className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  {doc.is_custom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete document"
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
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {selectedDoc ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedDoc.title}</h2>
                  <span className="text-xs text-slate-400 font-mono">{selectedDoc.filename}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {selectedDoc.category || 'Policy Document'}
                </span>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[480px] overflow-y-auto">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Policy Document</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warranty Replacement Terms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warranty"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policy Content (TXT)
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste policy clauses and terms here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
