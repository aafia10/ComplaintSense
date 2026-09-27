import React from 'react';
import { 
  BrainCircuit, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Search, 
  Bot, 
  FileText, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  ShoppingBag, 
  Cloud, 
  Truck, 
  Radio,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Workspace } from '../api/client';

interface LandingPageProps {
  onExploreDemo: () => void;
  onSelectWorkspace: (ws: Workspace) => void;
  workspaces: Workspace[];
  onCreateWorkspace: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreDemo,
  onSelectWorkspace,
  workspaces,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 border-b border-slate-200 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-sm mb-6 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>NLP-Based Customer Complaint Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
            Turn customer complaints into{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
              actionable intelligence.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Move beyond simple ticket department routing. Analyze what customers are complaining about, detect underlying customer intent, uncover recurring cluster trends, and identify root-cause patterns with transparent offline NLP.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all group"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                if (workspaces.length > 0) onSelectWorkspace(workspaces[0]);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition"
            >
              Enter Default Workspace
            </button>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">4 Industries</div>
              <div className="text-xs text-slate-500 mt-0.5">Preconfigured workspaces</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">170+ Seeded</div>
              <div className="text-xs text-slate-500 mt-0.5">Real NLP-analyzed records</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">100% Free</div>
              <div className="text-xs text-slate-500 mt-0.5">Local SQLite & scikit-learn</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">Zero Paid APIs</div>
              <div className="text-xs text-slate-500 mt-0.5">No cloud vendor lock-in</div>
            </div>
          </div>

        </div>
      </section>

      {/* Differentiator Section: Traditional Routing vs ComplaintSense */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Why ComplaintSense is Fundamentally Different
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
            Traditional ticketing systems treat complaints as tasks to push off to a department. ComplaintSense extracts business intelligence to prevent recurring failures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Traditional */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm relative opacity-80">
            <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 mb-4">
              Traditional Ticketing System
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Basic Complaint Routing
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Only routes "Complaint $\to$ Department" without deep linguistic analysis</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Confuses topic with intent (e.g. treats refund request as generic billing)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Isolated ticket queues that fail to detect regional partner anomalies</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>No automated local knowledge synthesis or grounded response drafting</span>
              </div>
            </div>
          </div>

          {/* ComplaintSense */}
          <div className="p-7 rounded-2xl bg-white border-2 border-indigo-500/80 shadow-xl shadow-indigo-100 relative">
            <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-4">
              ComplaintSense Platform
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              Actionable Complaint Intelligence
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Multi-Stage NLP:</strong> Preprocessing, classification, intent, sentiment tone & transparent urgency signals</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Topic vs Intent:</strong> Identifies underlying request (Replacement, Refund, Reroute) vs broader topic</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Root-Cause Patterns:</strong> Uncovers recurring co-occurrences (e.g. Mumbai + SpeedFast courier delays)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Human-in-the-Loop:</strong> Contextual response draft grounded in local policy documents for agent approval</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How the Intelligence Pipeline Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              An explainable 4-phase transformation from raw text to operational decision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Collect</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ingests customer feedback, support inquiries, emails, and ticket submissions across company channels.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Understand</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tokens, lemmatization, category prediction, customer intent, VADER tone, urgency signals (0-100), and entity extraction.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Discover</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                TF-IDF similarity search, recurring thematic clusters, statistical period trends, and emerging root-cause hypotheses.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm mb-3">
                4
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Act</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Department recommendations, local knowledge retrieval, and editable empathetic response drafts requiring human review.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Demo Companies Showcase */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Demo Environments Across Sectors
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select any preconfigured workspace to see live domain-specific analytics and knowledge bases.
            </p>
          </div>
          <button
            onClick={onExploreDemo}
            className="mt-4 sm:mt-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Browse all workspaces →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => onSelectWorkspace(ws)}
              className="p-5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {ws.industry}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition">
                  {ws.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                  {ws.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                <span>{ws.ticket_count || 45}+ tickets</span>
                <span className="text-indigo-600 font-semibold">Launch Demo</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ComplaintSense: An NLP-Based Customer Complaint Intelligence, Analysis and Resolution Platform</span>
          <span>Free Local MVP • SQLite • scikit-learn • FastAPI • React</span>
        </div>
      </footer>

    </div>
  );
};
