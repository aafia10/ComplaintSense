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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-slate-200 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI-Powered Customer Complaint Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
            Turn customer complaints into{' '}
            <span className="text-emerald-700">
              actionable intelligence.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Move beyond simple ticket routing. Understand customer sentiment and root causes, discover emerging issues and recurring patterns, recommend grounded actions, and continuously learn from agent feedback — 100% free and locally runnable.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer group"
            >
              <span>Explore Interactive Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => {
                if (workspaces.length > 0) onSelectWorkspace(workspaces[0]);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              Launch Default Workspace
            </button>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
            <div className="bg-white/90 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-slate-900">4 Industries</div>
              <div className="text-xs text-slate-500 mt-0.5">Preconfigured workspaces</div>
            </div>
            <div className="bg-white/90 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-emerald-700">170+ Seeded</div>
              <div className="text-xs text-slate-500 mt-0.5">Real NLP-analyzed records</div>
            </div>
            <div className="bg-white/90 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-slate-900">100% Free</div>
              <div className="text-xs text-slate-500 mt-0.5">Local SQLite & scikit-learn</div>
            </div>
            <div className="bg-white/90 p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-emerald-700">Zero Paid APIs</div>
              <div className="text-xs text-slate-500 mt-0.5">No cloud vendor lock-in</div>
            </div>
          </div>

        </div>
      </section>

      {/* Differentiator Section: Traditional Routing vs ComplaintSense */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Why ComplaintSense is Fundamentally Different
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl mx-auto">
            Traditional ticketing systems treat complaints as tasks to push off to a department. ComplaintSense extracts business intelligence to prevent recurring failures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs opacity-85">
            <div className="inline-flex px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 mb-3">
              Traditional Ticketing System
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-3">
              Basic Ticket Routing
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Only routes "Complaint → Department" without deep linguistic intelligence</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Confuses topic with intent (e.g. treats refund demand as generic billing)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Isolated ticket queues fail to surface regional partner failure spikes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>No automated local policy synthesis or grounded response drafting</span>
              </div>
            </div>
          </div>

          {/* ComplaintSense */}
          <div className="p-6 rounded-xl bg-white border-2 border-emerald-600/80 shadow-sm">
            <div className="inline-flex px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50 mb-3">
              ComplaintSense Platform
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <span>Actionable Complaint Intelligence</span>
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </h3>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Multi-Stage NLP:</strong> Preprocessing, classification, intent, sentiment tone & transparent urgency signals</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Topic vs Intent:</strong> Identifies underlying request (Replacement, Refund, Reroute) vs broader topic</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Root-Cause Patterns:</strong> Uncovers recurring co-occurrences (e.g. Mumbai + SpeedFast courier delays)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Human-in-the-Loop:</strong> Contextual response draft grounded in local policy documents for agent approval</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              How the Intelligence Pipeline Works
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Understand → Discover → Act → Learn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2.5">
                1
              </div>
              <h4 className="font-bold text-xs text-slate-900 mb-1">Understand</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tokens, lemmatization, category prediction, customer intent, VADER tone, urgency signals (0-100), and entity extraction.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2.5">
                2
              </div>
              <h4 className="font-bold text-xs text-slate-900 mb-1">Discover</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                TF-IDF similarity search, recurring thematic clusters, statistical period trends, and emerging root-cause hypotheses.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2.5">
                3
              </div>
              <h4 className="font-bold text-xs text-slate-900 mb-1">Act</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Department routing, tone controllers, local knowledge retrieval, and editable empathetic drafts requiring agent sign-off.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2.5">
                4
              </div>
              <h4 className="font-bold text-xs text-slate-900 mb-1">Learn</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Continuous human-in-the-loop feedback audit logging, knowledge gap discovery, and model health tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Companies Showcase */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Preconfigured Industry Workspaces
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any workspace to explore domain-specific complaints and policies.
            </p>
          </div>
          <button
            onClick={onExploreDemo}
            className="mt-3 sm:mt-0 text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse all workspaces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => onSelectWorkspace(ws)}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-600 bg-white hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {ws.industry}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition">
                  {ws.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                  {ws.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                <span>{ws.ticket_count || 45}+ tickets</span>
                <span className="text-emerald-700 font-semibold">Launch Demo</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-xs text-slate-400 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ComplaintSense: AI-Powered Customer Complaint Intelligence Platform</span>
          <span>100% Free & Local • SQLite • scikit-learn • FastAPI • React</span>
        </div>
      </footer>

    </div>
  );
};
