import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2, ArrowRight } from 'lucide-react';
import { Workspace } from '../api/client';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: Workspace;
  onImportComplete?: () => void;
  onImportCompleted?: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  activeWorkspace,
  onImportComplete,
  onImportCompleted,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const notifyComplete = () => {
    if (onImportCompleted) onImportCompleted();
    if (onImportComplete) onImportComplete();
  };

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
      notifyComplete();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-modal w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#23364D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Bulk CSV Complaint Ingestion</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Workspace: {activeWorkspace.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#13263A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="border-2 border-dashed border-slate-200 dark:border-[#23364D] rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors">
              <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Upload CSV file</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                Select a CSV file containing complaints. Supported headers:
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[11px]">
                <code className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded font-mono">Subject</code>
                <code className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded font-mono">Message</code>
                <code className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded font-mono">Customer Name</code>
                <code className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded font-mono">Customer Email</code>
              </div>

              <label className="mt-5 inline-block px-5 py-2.5 bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-subtle cursor-pointer min-h-[44px]">
                <span>Select File from Computer</span>
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          )}

          {/* STEP 2: Preview & Validation */}
          {step === 'preview' && validationResult && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-[#13263A] rounded-xl border border-slate-200 dark:border-[#23364D] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">File: {file?.name}</span>
                  <span className="text-blue-700 dark:text-blue-400 font-bold">
                    {validationResult.total_rows} rows detected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-[#23364D]">
                  <div>
                    <span className="text-slate-400 block">Valid Format:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                      {validationResult.is_valid ? 'Yes' : 'Contains format warnings'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Detected Columns:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                      {validationResult.detected_columns?.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Rows Preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sample Preview (First 3 Records)</span>
                <div className="border border-slate-200 dark:border-[#23364D] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-[#13263A] font-bold text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5">Message</th>
                        <th className="p-2.5">Customer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#23364D]">
                      {validationResult.sample_rows?.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#13263A]/50">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">{row.subject}</td>
                          <td className="p-2.5 truncate max-w-[200px]">{row.message}</td>
                          <td className="p-2.5 truncate max-w-[100px]">{row.customer_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#13263A] rounded-xl"
                >
                  Choose Different File
                </button>
                <button
                  onClick={handleExecuteImport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-subtle cursor-pointer min-h-[44px]"
                >
                  <span>Run Batch NLP Ingestion</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Importing */}
          {step === 'importing' && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Batch Processing NLP Pipeline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Preprocessing text, computing TF-IDF vectors, predicting issue topics, scoring sentiment, and calculating urgency signals...
              </p>
            </div>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Complete!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Successfully analyzed and indexed <strong>{importedCount}</strong> complaints into workspace <strong>{activeWorkspace.name}</strong>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-subtle cursor-pointer min-h-[44px]"
              >
                Close & View Complaints
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
