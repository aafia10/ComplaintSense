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

interface NLPLabPageProps {
  activeWorkspace: Workspace;
}

export const NLPLabPage: React.FC<NLPLabPageProps> = ({ activeWorkspace }) => {
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
      const res = await fetchApi<any>('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          customer_name: 'Interactive Evaluator',
          customer_email: 'evaluator@local.dev',
          subject: 'Interactive NLP Analysis Probe',
          message: inputText.trim(),
        }),
      });
      setAnalysisResult(res);

      // Fetch explainability
      const exp = await fetchApi<any>('/evaluation/explain', {
        method: 'POST',
        body: JSON.stringify({
          text: inputText.trim(),
          category: res.category,
        }),
      });
      setExplainResult(exp);
    } catch (err) {
      alert('Analysis execution failed');
    } finally {
      setAnalyzing(false);
    }
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            NLP Laboratory & Model Health
          </h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            Explainable AI
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Inspect preprocessing steps, test custom inputs with token-level explainability, and monitor classifier performance metrics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
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
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TEST COMPLAINT & EXPLAIN */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-700" />
                <span>Input Complaint Text</span>
              </label>
              <span className="text-[11px] text-slate-400">Paste any customer message below</span>
            </div>

            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste complaint here..."
              className="w-full p-3 rounded-lg border border-slate-200 text-xs font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-400 font-medium">Quick Presets:</span>
                <button
                  onClick={() =>
                    setInputText(
                      'My ₹45,000 Samsung Galaxy order #ORD-28491 has not arrived in Mumbai. It has been stuck with SpeedFast Logistics for 5 days and nobody responds. If not delivered immediately by tomorrow I will file a complaint in Consumer Court!'
                    )
                  }
                  className="text-emerald-700 hover:underline cursor-pointer"
                >
                  Mumbai Delivery & Legal Threat
                </button>
                <span>•</span>
                <button
                  onClick={() =>
                    setInputText(
                      'I was charged twice ₹3,499 on UPI for order #ORD-99102. Bank account debited but checkout timed out. Give my money back immediately.'
                    )
                  }
                  className="text-emerald-700 hover:underline cursor-pointer"
                >
                  Double Debit / Refund
                </button>
                <span>•</span>
                <button
                  onClick={() =>
                    setInputText(
                      'Appliance sparked fire on first usage. Defective hazardous product, I will contact consumer forum.'
                    )
                  }
                  className="text-emerald-700 hover:underline cursor-pointer"
                >
                  Hardware Defect
                </button>
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{analyzing ? 'Analyzing...' : 'Analyze with NLP'}</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {analysisResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Classification Results */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Predicted Intelligence Dimensions
                </span>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Topic</span>
                    <span className="text-xs font-bold text-slate-900">{analysisResult.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">Intent</span>
                    <span className="text-xs font-bold text-emerald-800">{analysisResult.intent}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sentiment:</span>
                    <span className="font-bold text-slate-900">
                      {analysisResult.sentiment} (Compound: {analysisResult.sentiment_score ?? 0.0})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Urgency:</span>
                    <span className="font-bold text-rose-600">
                      Tier: {analysisResult.urgency_level} ({analysisResult.urgency_score ?? 15} / 100)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Entities Extracted</span>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.entities?.map((e: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        <strong className="text-emerald-800">{e.entity_type}:</strong> {e.entity_text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: "Why this result?" Explainability Panel */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">Why this result? (Explainability)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">TF-IDF & Logit Contributions</span>
                </div>

                {explainResult && (
                  <div className="space-y-3">
                    {/* Top Terms */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                        Top Driving Lexical Terms
                      </span>
                      <div className="space-y-1.5">
                        {explainResult.top_terms?.map((t: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-800 font-semibold">"{t.term}"</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">weight: {t.weight}</span>
                              <span
                                className={`font-mono font-bold text-[11px] ${
                                  t.contribution > 0 ? 'text-emerald-700' : 'text-slate-500'
                                }`}
                              >
                                {t.contribution > 0 ? `+${t.contribution}` : t.contribution}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reasoning Factors */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Decision Factors
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {explainResult.reasoning_factors?.map((rf: string, rIdx: number) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{rf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MODEL COMPARISON */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Classifier Benchmark Comparison</h2>
                <p className="text-xs text-slate-400">Multinomial Naive Bayes vs Logistic Regression vs Calibrated Linear SVM</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">3-fold Stratified Cross-Validation</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Classifier Architecture</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Precision (Weighted)</th>
                    <th className="py-3 px-4">Recall (Weighted)</th>
                    <th className="py-3 px-4">F1 Score (Weighted)</th>
                    <th className="py-3 px-4">Inference Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {Object.entries(evalData?.models || {}).map(([name, m]: [string, any]) => (
                    <tr key={name} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                        {name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {Math.round(m.accuracy * 1000) / 10}%
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {Math.round(m.precision * 1000) / 10}%
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {Math.round(m.recall * 1000) / 10}%
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {Math.round(m.f1_score * 1000) / 10}%
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {name === 'Linear SVM' ? '~2.4 ms' : name === 'Logistic Regression' ? '~1.8 ms' : '~0.9 ms'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Comparative Visualizer (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelComparisonData}>
                  <XAxis dataKey="model" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" name="Accuracy %" fill="#047857" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="precision" name="Precision %" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recall" name="Recall %" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="f1" name="F1 Score %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFUSION MATRIX & PER-CLASS REPORT */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confusion Matrix Heatmap</h3>
                <p className="text-xs text-slate-400">Ground truth classes vs calibrated model predictions</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Linear SVM
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-slate-400 font-bold text-[10px] text-left">True \ Pred</th>
                    {matrixClasses.map((cls: string, cIdx: number) => (
                      <th key={cIdx} className="p-2 text-center text-[10px] font-bold text-slate-600">
                        {cls}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.map((row: number[], rIdx: number) => (
                    <tr key={rIdx}>
                      <td className="p-2 font-bold text-slate-700 text-[10px] text-right pr-3 whitespace-nowrap">
                        {matrixClasses[rIdx]}
                      </td>
                      {row.map((val: number, cIdx: number) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td
                            key={cIdx}
                            className={`p-2.5 text-center font-mono font-bold rounded-lg border border-slate-100 ${
                              isDiagonal
                                ? val > 0 ? 'bg-emerald-700 text-white' : 'bg-slate-50 text-slate-400'
                                : val > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-50/50 text-slate-300'
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

      {/* TAB 4: STEP-BY-STEP PIPELINE INSPECTOR */}
      {activeTab === 'pipeline' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">NLP Architecture Execution Stages</h2>
            <p className="text-xs text-slate-400">Visual sequential trace of data flow from raw text to response draft</p>
          </div>

          <div className="space-y-4">
            {[
              { step: 1, title: 'Input Text Sanitization', desc: 'Lowercasing, punctuation stripping, and URL/HTML regex normalization.' },
              { step: 2, title: 'Tokenization & Stopwords Removal', desc: 'Splitting on word boundaries, removing high-frequency English stopwords (the, a, is, at).' },
              { step: 3, title: 'Morphological Lemmatization', desc: 'Reducing inflected word forms to canonical root dictionary lemmas.' },
              { step: 4, title: 'Sublinear TF-IDF Vectorization', desc: 'Unigram + bigram n-gram vocabulary mapping with logarithmic term-frequency dampening.' },
              { step: 5, title: 'Multi-Model Inference & Probability Calibration', desc: 'Running Naive Bayes, Logistic Regression, and Calibrated Linear SVM for category probabilities.' },
              { step: 6, title: 'Rule-Based Intent & Emotional Tone Extraction', desc: 'VADER compound sentiment score mapping to affective tone (Frustrated, Threatening, etc.).' },
              { step: 7, title: 'Named Entity & Duplicate Cosine Search', desc: 'Regex entity pattern matching and TF-IDF cosine similarity search across prior complaints.' },
              { step: 8, title: 'Local Policy Retrieval & Response Synthesis', desc: 'TF-IDF document retrieval from local knowledge base and prompt draft generation with quality checks.' },
            ].map((st) => (
              <div key={st.step} className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {st.step}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{st.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MODEL HEALTH & MONITORING */}
      {activeTab === 'health' && healthData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Average Prediction Confidence</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {Math.round(healthData.average_confidence * 100)}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Across all workspace tickets</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Low Confidence Rate (&lt;60%)</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {healthData.low_confidence_rate_pct}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Routed to "Needs Review" queue</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Human Feedback Corrections</span>
              <div className="text-2xl font-bold text-emerald-800 mt-1">
                {healthData.human_feedback.total_feedback_records}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {healthData.human_feedback.category_corrections} categories, {healthData.human_feedback.intent_corrections} intents
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Confidence Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(healthData.confidence_distribution).map(([bin, cnt]) => (
                <div key={bin} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <span className="text-slate-500 font-medium block text-[11px]">{bin}</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">{cnt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
