import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Terminal, 
  Layers, 
  Send, 
  FileCode, 
  Tag, 
  Activity, 
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { fetchApi, Workspace } from '../api/client';

interface NLPAnalysisPageProps {
  activeWorkspace: Workspace;
}

export const NLPAnalysisPage: React.FC<NLPAnalysisPageProps> = ({
  activeWorkspace,
}) => {
  const [inputText, setInputText] = useState(
    'My ₹45,000 Samsung Galaxy smartphone order #ORD28491 has not arrived in Mumbai. It has been stuck with SpeedFast Logistics for four days and nobody responds. If not delivered immediately by tomorrow I will file a complaint in Consumer Court!'
  );
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!inputText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      // We create a temporary ticket or run analyze endpoint
      const res = await fetchApi<any>('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          customer_name: 'Academic Evaluator',
          customer_email: 'evaluator@academic.edu',
          subject: 'Live NLP Pipeline Evaluation',
          message: inputText.trim(),
        }),
      });
      setAnalysisResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute NLP analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <Cpu className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic NLP Pipeline Demonstration
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50">
            Explainable Machine Learning
          </span>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          Inspect each stage of text transformation: Normalization, Tokenization, Stopwords Filtering, POS Lemmatization, TF-IDF Vectorization, VADER Polarity, Signal Urgency Engine, and Named Entity Recognition.
        </p>
      </div>

      {/* Interactive Input Playground */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>Interactive Input Complaint</span>
          </label>
          <span className="text-[11px] text-slate-400">Type or paste test text below</span>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type any unstructured customer complaint..."
          className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="text-slate-400">Presets:</span>
            <button
              onClick={() => setInputText('My ₹45,000 Samsung Galaxy smartphone order #ORD28491 has not arrived in Mumbai. It has been stuck with SpeedFast Logistics for four days and nobody responds. If not delivered immediately by tomorrow I will file a complaint in Consumer Court!')}
              className="text-indigo-600 hover:underline"
            >
              Mumbai Delay & Court
            </button>
            <span>•</span>
            <button
              onClick={() => setInputText('I was charged twice ₹2,999 on UPI for order #ORD99102. Bank account debited but checkout timed out. Give my money back.')}
              className="text-indigo-600 hover:underline"
            >
              Double Debit & Refund
            </button>
            <span>•</span>
            <button
              onClick={() => setInputText('Mixer grinder motor sparked with fire on first use. Defective dangerous appliance. Sending police notice.')}
              className="text-indigo-600 hover:underline"
            >
              Hardware Safety Hazard
            </button>
          </div>

          <button
            onClick={runAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-100 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Decompose & Analyze</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Analysis Decomposition Grid */}
      {analysisResult && (
        <div className="space-y-6">
          
          {/* Stage 1: Preprocessing Stages (Tokens -> Stops -> Lemmatized) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
                1
              </span>
              NLP Stage 1: Text Preprocessing & Morphological Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  1. Tokenization ({analysisResult.preprocessed_tokens?.length || 0} tokens)
                </span>
                <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto font-mono text-[11px]">
                  {analysisResult.preprocessed_tokens?.map((tok: string, idx: number) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {tok}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  2. Lemmatized Representation
                </span>
                <p className="text-xs font-mono text-indigo-900 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed max-h-40 overflow-y-auto">
                  {analysisResult.lemmatized_text || 'None'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  3. Topic vs Customer Intent
                </span>
                <div className="space-y-2 mt-2">
                  <div className="text-xs">
                    <span className="text-slate-500">Predicted Topic:</span>{' '}
                    <span className="font-bold text-slate-900">{analysisResult.category}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">Extracted Intent:</span>{' '}
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {analysisResult.intent}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Stage 2: Sentiment, Emotional Tone & Urgency Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* VADER Sentiment */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                VADER Sentiment & Emotional Tone
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Classification:</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    analysisResult.sentiment === 'Negative' ? 'bg-rose-100 text-rose-800' :
                    analysisResult.sentiment === 'Positive' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {analysisResult.sentiment}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">VADER Compound Score:</span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {analysisResult.sentiment_score ?? 0.0} (-1.0 to +1.0)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Customer Message Tone:</span>
                  <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {analysisResult.emotional_tone || 'Neutral'}
                  </span>
                </div>
              </div>
            </div>

            {/* Urgency Scoring Engine */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
                  3
                </span>
                Urgency Signals Engine
              </h3>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase">
                    Tier: {analysisResult.urgency_level}
                  </span>
                  <span className="text-xl font-black text-rose-600">
                    {analysisResult.urgency_score ?? 15} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block">
                    Triggered Signals ({analysisResult.urgency_signals?.length || 0}):
                  </span>
                  {analysisResult.urgency_signals?.map((sig: any, idx: number) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 font-semibold text-[10px]">
                        {sig.type}
                      </span>
                      <span>keyword <strong>"{sig.keyword}"</strong> - {sig.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Stage 3: Named Entity Recognition */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
                4
              </span>
              Named Entity Extraction (NER)
            </h3>

            <div className="flex flex-wrap gap-2">
              {analysisResult.entities && analysisResult.entities.length > 0 ? (
                analysisResult.entities.map((ent: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                  >
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                      {ent.entity_type}
                    </span>
                    <span className="font-bold text-slate-800">{ent.entity_text}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No domain entities detected in text.</span>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
