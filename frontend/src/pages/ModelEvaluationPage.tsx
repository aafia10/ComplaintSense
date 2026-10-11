import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  BarChart2, 
  Award, 
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { fetchApi } from '../api/client';

export const ModelEvaluationPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi<any>('/evaluation');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load evaluation metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <div className="text-xs text-slate-500 font-medium">Loading genuine scikit-learn evaluation metrics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          Failed to load model metrics: {error}
        </div>
      </div>
    );
  }

  const modelComparisonData = Object.entries(data.models || {}).map(([model, metrics]: [string, any]) => ({
    model,
    accuracy: Math.round(metrics.accuracy * 100),
    precision: Math.round(metrics.precision * 100),
    recall: Math.round(metrics.recall * 100),
    f1: Math.round(metrics.f1_score * 100),
  }));

  const matrixClasses = data.confusion_matrix?.classes || [];
  const matrixData = data.confusion_matrix?.matrix || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Machine Learning Model Evaluation
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50">
            Academic Validation
          </span>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          Empirical evaluation results of scikit-learn classifiers on customer complaint corpora. Evaluates Multinomial Naive Bayes, Logistic Regression, and Linear SVM across 7 standard categories.
        </p>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Classifier Performance Comparison
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {data.sample_count} cross-validated samples
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Classifier Model</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision (Weighted)</th>
                <th className="py-3 px-4">Recall (Weighted)</th>
                <th className="py-3 px-4">F1 Score (Weighted)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {Object.entries(data.models || {}).map(([modelName, m]: [string, any], idx) => (
                <tr key={modelName} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    {modelName}
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
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {Math.round(m.f1_score * 1000) / 10}%
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                      Trained on Disk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Comparison Recharts Visualizer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Comparative Metric Visualizer (%)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelComparisonData}>
              <XAxis dataKey="model" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="accuracy" name="Accuracy %" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="precision" name="Precision %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" name="Recall %" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1" name="F1 Score %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion Matrix Heatmap */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Confusion Matrix</h3>
            <p className="text-xs text-slate-400">Predicted classes vs ground truth</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Linear SVM Classifier</span>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
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
                              ? val > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
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

      {/* Per-Category Classification Report */}
      {data.classification_report && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Per-Category Precision, Recall & F1 Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(data.classification_report).map(([catName, rep]: [string, any]) => (
              <div key={catName} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 truncate" title={catName}>
                  {catName}
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px] pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[9px]">PRECISION</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(rep.precision * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">RECALL</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(rep.recall * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">F1</span>
                    <span className="font-mono font-bold text-indigo-700">{Math.round(rep.f1_score * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
