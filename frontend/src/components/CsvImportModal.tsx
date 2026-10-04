import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2, ArrowRight } from 'lucide-react';
import { Workspace } from '../api/client';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: Workspace;
  onImportComplete: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  activeWorkspace,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
      validateFile(selected);
    }
  };

  const validateFile = async (selectedFile: File) => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('http://localhost:8000/api/data/validate-csv', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Validation failed');
      }

      const data = await res.json();
      setValidationResult(data);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file');
    }
  };

  const handleExecuteImport = async () => {
    if (!file) return;
    try {
      setImporting(true);
      setStep('importing');
      const formData = new FormData();
      formData.append('workspace_id', activeWorkspace.id);
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/api/data/bulk-import', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Bulk import failed');

      const data = await res.json();
      setImportedCount(data.imported_count);
      setStep('done');
      onImportComplete();
    } catch (err: any) {
      setError(err.message || 'Import failed');
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setStep('upload');
    setError(null);
    setImportedCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bulk CSV Complaint Ingestion</h2>
              <p className="text-xs text-slate-500">Workspace: {activeWorkspace.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/20 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Choose a CSV file or drag and drop here</p>
                <p className="text-[11px] text-slate-400 mt-1">Supports UTF-8 or ASCII CSV with complaint text</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="mt-4 inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Select CSV File
                </label>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">Recommended CSV Columns:</span>
                <p className="text-[11px] text-slate-500">
                  <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">Subject</code>,{' '}
                  <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">Message</code>,{' '}
                  <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">Customer Name</code>,{' '}
                  <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">Customer Email</code>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Validation */}
          {step === 'preview' && validationResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">{validationResult.filename}</span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    ✓ {validationResult.total_columns} columns detected • Ready for batch NLP pipeline
                  </span>
                </div>
                <button onClick={handleReset} className="text-xs text-slate-500 hover:underline">
                  Change File
                </button>
              </div>

              {/* Detected Column Mapping */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Message Column:</span>
                  <span className="font-mono text-emerald-800 font-semibold">
                    {validationResult.detected_mapping?.message_column || 'Not found'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Subject Column:</span>
                  <span className="font-mono text-emerald-800 font-semibold">
                    {validationResult.detected_mapping?.subject_column || 'Optional / Auto-generated'}
                  </span>
                </div>
              </div>

              {/* Preview Rows */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">First 3 Preview Rows:</span>
                <div className="border border-slate-200 rounded-xl overflow-x-auto text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        {validationResult.columns.slice(0, 4).map((c: string) => (
                          <th key={c} className="p-2 whitespace-nowrap">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {validationResult.preview_rows.slice(0, 3).map((r: any, idx: number) => (
                        <tr key={idx}>
                          {validationResult.columns.slice(0, 4).map((c: string) => (
                            <td key={c} className="p-2 max-w-[160px] truncate">{r[c]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteImport}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  <span>Execute Batch NLP Ingestion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Importing Progress */}
          {step === 'importing' && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-900">Executing NLP Pipeline on Imported Complaints</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Running tokenization, TF-IDF vectorization, Naive Bayes/SVM classification, intent extraction, and VADER sentiment...
              </p>
            </div>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-slate-900">Ingestion & Analysis Complete</div>
              <p className="text-xs text-slate-600">
                Successfully processed and analyzed <span className="font-bold text-emerald-800">{importedCount} complaints</span>.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  View Complaints in Workbench
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
