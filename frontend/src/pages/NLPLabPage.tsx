import React, { useEffect, useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  Award,
  Layers,
  Activity,
  Cpu,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  HelpCircle,
  BarChart2,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { fetchApi, Workspace, ModelHealthData } from '../api/client';
import { useTheme } from '../context/ThemeContext';

interface NLPLabPageProps {
  activeWorkspace: Workspace;
}

export const NLPLabPage: React.FC<NLPLabPageProps> = ({ activeWorkspace }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'test' | 'models' | 'evaluation' | 'pipeline' | 'health'>('test');

  // Test complaint state
  const [inputText, setInputText] = useState(
    'My ₹45,000 Samsung Galaxy order #ORD-28491 has not arrived in Mumbai. It has been stuck with SpeedFast Logistics for 5 days and nobody responds. If not delivered immediately by tomorrow I will file a complaint in Consumer Court!'
  );
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [explainResult, setExplainResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Model evaluation & health state
  const [evalData, setEvalData] = useState<any>(null);
  const [healthData, setHealthData] = useState<ModelHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLabData();
  }, []);

  const loadLabData = async () => {
    try {
      setLoading(true);
      const [ev, hl] = await Promise.all([
        fetchApi<any>('/evaluation'),
        fetchApi<ModelHealthData>('/evaluation/model-health'),
      ]);
      setEvalData(ev);
      setHealthData(hl);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!inputText.trim()) return;
    try {
      setAnalyzing(true);
      const [ana, exp] = await Promise.all([
        fetchApi<any>('/evaluation/test-pipeline', {
          method: 'POST',
          body: JSON.stringify({ text: inputText }),
        }),
        fetchApi<any>('/evaluation/explain', {
          method: 'POST',
          body: JSON.stringify({ text: inputText }),
        }),
      ]);
      setAnalysisResult(ana);
      setExplainResult(exp);
    } catch (err) {
      console.error(err);
      alert('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const tooltipStyle = {
    backgroundColor: isDark ? '#0D1B2A' : '#FFFFFF',
    borderRadius: '12px',
    border: isDark ? '1px solid #23364D' : '1px solid #E2E8F0',
    color: isDark ? '#F8FAFC' : '#0F172A',
    fontSize: '12px',
  };

  const modelComparisonData = Object.entries(evalData?.models || {}).map(([model, m]: [string, any]) => ({
    model,
    accuracy: Math.round(m.accuracy * 100),
    precision: Math.round(m.precision * 100),
    recall: Math.round(m.recall * 100),
    f1: Math.round(m.f1_score * 100),
  }));

  const matrixClasses = evalData?.confusion_matrix?.classes || [];
  const matrixData = evalData?.confusion_matrix?.matrix || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#23364D]">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            NLP Laboratory & Model Health
          </h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Explainable AI
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Inspect pipeline stages, test custom grievances with feature explainability, and review stratified model performance.
        </p>
      </div>

      {/* Tabs (Horizontally Scrollable on Mobile) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#23364D] overflow-x-auto no-scrollbar text-sm font-semibold pb-1">
        {[
          { id: 'test', label: 'Test Complaint & Explain' },
          { id: 'models', label: 'Model Benchmark Comparison' },
          { id: 'evaluation', label: 'Confusion Matrix & Metrics' },
          { id: 'pipeline', label: 'Step-by-Step Pipeline Inspector' },
          { id: 'health', label: 'Model Health & Monitoring' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer min-h-[44px] flex items-center ${
              activeTab === tab.id
                ? 'border-[#0F2A5F] dark:border-blue-400 text-[#0F2A5F] dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: TEST COMPLAINT & EXPLAIN ================= */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Input Complaint Text</span>
              </label>
              <span className="text-xs text-slate-400">Paste any custom customer grievance below</span>
            </div>

            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste complaint here..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50/70 dark:bg-[#13263A] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Quick Presets:</span>
                <button
                  onClick={() =>
                    setInputText(
                      'My ₹45,000 Samsung Galaxy order #ORD-28491 has not arrived in Mumbai. It has been stuck with SpeedFast Logistics for 5 days and nobody responds. If not delivered immediately by tomorrow I will file a complaint in Consumer Court!'
                    )
                  }
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer min-h-[36px] flex items-center"
                >
                  Mumbai Delivery & Legal Threat
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() =>
                    setInputText(
                      'I was charged twice ₹3,499 on UPI for order #ORD-99102. Bank account debited but checkout timed out. Give my money back immediately.'
                    )
                  }
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer min-h-[36px] flex items-center"
                >
                  Double Debit / Refund
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() =>
                    setInputText(
                      'Appliance sparked fire on first usage. Defective hazardous product, I will contact consumer forum.'
                    )
                  }
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer min-h-[36px] flex items-center"
                >
                  Hardware Defect
                </button>
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold shadow-subtle transition cursor-pointer min-h-[44px]"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{analyzing ? 'Analyzing Pipeline...' : 'Analyze with NLP'}</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {analysisResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Classification Results */}
              <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Predicted Intelligence Dimensions
                </span>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D]">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Topic</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">{analysisResult.category}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 block mb-1">Intent</span>
                    <span className="text-sm font-extrabold text-blue-900 dark:text-blue-300">{analysisResult.intent}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Sentiment Polarity:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {analysisResult.sentiment} (Compound: {analysisResult.sentiment_score ?? 0.0})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Urgency Assessment:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      Tier: {analysisResult.urgency_level} ({analysisResult.urgency_score ?? 15} / 100)
                    </span>
                  </div>
                </div>

                {/* Preprocessing preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400 block">Lemmatized Tokens</span>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#13263A] text-xs font-mono">
                    {analysisResult.tokens?.map((tok: string, idx: number) => (
                      <span key={idx} className="bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#23364D] px-2 py-0.5 rounded text-slate-800 dark:text-slate-200">
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Explainability */}
              <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Transparent Decision Explainability
                </span>

                {explainResult ? (
                  <div className="space-y-4 text-sm">
                    {/* Top TF-IDF Drivers */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                        Top TF-IDF N-Gram Drivers for "{analysisResult.category}":
                      </span>
                      <div className="space-y-2">
                        {explainResult.top_feature_drivers?.map((driver: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#13263A] rounded-xl text-xs">
                            <span className="font-mono font-bold text-blue-900 dark:text-blue-300">"{driver.feature}"</span>
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">Weight: {driver.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Urgency Factor Drivers */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Urgency Signal Breakdown:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {explainResult.urgency_factors?.map((f: string, idx: number) => (
                          <span key={idx} className="text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">Execute analysis to compute token weights.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MODEL COMPARISON ================= */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Classifier Benchmark Performance</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
              Stratified cross-validation scores on genuine grievance text across 3 scikit-learn models
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="model" tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={{ stroke: isDark ? '#23364D' : '#E2E8F0' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={{ stroke: isDark ? '#23364D' : '#E2E8F0' }} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="precision" fill="#10B981" name="Precision" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recall" fill="#F59E0B" name="Recall" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="f1" fill="#8B5CF6" name="F1 Score" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CONFUSION MATRIX ================= */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1B2A] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Confusion Matrix</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">Actual category vs predicted category distribution</p>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-2.5 text-left text-slate-400">Actual \ Predicted</th>
                    {matrixClasses.map((cls: string) => (
                      <th key={cls} className="p-2.5 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                        {cls}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.map((row: number[], rowIdx: number) => (
                    <tr key={rowIdx}>
                      <td className="p-2.5 text-left font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {matrixClasses[rowIdx]}
                      </td>
                      {row.map((val: number, colIdx: number) => {
                        const isDiag = rowIdx === colIdx;
                        return (
                          <td
                            key={colIdx}
                            className={`p-2.5 font-bold ${
                              isDiag
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200'
                                : val > 0
                                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PIPELINE INSPECTOR ================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { step: '1. Text Normalization', desc: 'Strips HTML, URLs, emojis, and normalizes casing to lowercase.' },
              { step: '2. POS Lemmatization', desc: 'WordNet lemmatization maps tokens to root base forms (e.g. broken → break).' },
              { step: '3. TF-IDF Vectorization', desc: 'Extracts unigrams and bigrams with sublinear TF scaling.' },
              { step: '4. Issue Topic Classification', desc: 'Ensemble predicts category using multinomial log probabilities.' },
              { step: '5. Intent Disambiguation', desc: 'Separates complaint subject from underlying desired action.' },
              { step: '6. Urgency Signal Scoring', desc: 'Transparent 0–100 point scoring across 5 distinct risk signal families.' },
            ].map((p, idx) => (
              <div key={idx} className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card space-y-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">{p.step}</span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: MODEL HEALTH ================= */}
      {activeTab === 'health' && healthData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Health Status</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {healthData.status}
              </span>
            </div>
            <div className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Inferences</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
                {healthData.total_inferences}
              </span>
            </div>
            <div className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Latency</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
                {healthData.avg_latency_ms} ms
              </span>
            </div>
            <div className="bg-white dark:bg-[#0D1B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#23364D] shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Model</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-2 block truncate">
                {healthData.active_model}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
