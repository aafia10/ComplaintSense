import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Clock,
  FileSpreadsheet,
  BookOpen,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  ShieldAlert,
  ChevronDown,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface AdminHelperChatbotProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewComplaint?: () => void;
  onOpenDemoModal?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  action?: {
    label: string;
    tab?: string;
    callback?: () => void;
  };
  timestamp: string;
}

interface QuickTopic {
  id: string;
  label: string;
  query: string;
  category: 'workflow' | 'sla' | 'data' | 'ai';
}

const QUICK_TOPICS: QuickTopic[] = [
  { id: 'resolve', label: 'How to Resolve a Ticket', query: 'How do I review and resolve a complaint?', category: 'workflow' },
  { id: 'sla', label: 'Understanding SLA Deadlines', query: 'What do the SLA Tracker and breach countdowns mean?', category: 'sla' },
  { id: 'duplicate', label: 'Duplicate Complaint Detection', query: 'How does duplicate complaint detection work?', category: 'ai' },
  { id: 'csv', label: 'Importing CSV Complaints', query: 'How do I upload complaints from a CSV spreadsheet?', category: 'data' },
  { id: 'review_queue', label: "What is 'Needs Review'?", query: "What does the 'Needs Review' tab do?", category: 'workflow' },
  { id: 'sop', label: 'Adding SOPs & Policies', query: 'How do I add a new SOP or fill a knowledge gap?', category: 'ai' },
  { id: 'sentiment', label: 'Sentiment & Urgency Scores', query: 'How do sentiment and urgency scores work?', category: 'ai' },
  { id: 'escalate', label: 'When to Escalate', query: 'When and how should I escalate a complaint?', category: 'workflow' },
  { id: 'playbooks', label: 'Resolution Playbooks', query: 'How do I use the Resolution Playbooks checklists?', category: 'workflow' },
];

export const AdminHelperChatbot: React.FC<AdminHelperChatbotProps> = ({
  onNavigateTab,
  onOpenNewComplaint,
  onOpenDemoModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "👋 **Hello! I'm your ComplaintSense Admin Copilot.**\n\nI'm designed to help you run customer operations smoothly — **no technical or coding background needed**!\n\nAsk me anything in plain English, or click one of the quick guide topics below:",
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Answer generator after short natural delay
    setTimeout(() => {
      const botResponse = generateKnowledgeResponse(text);
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 400);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: "🧹 **Chat cleared.** How else can I assist you with managing ComplaintSense?",
        timestamp: 'Just now',
      },
    ]);
  };

  // Plain-English Non-Technical Knowledge Base Engine
  const generateKnowledgeResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = `bot-${Date.now()}`;

    // 1. SLA Tracker & Deadlines
    if (q.includes('sla') || q.includes('deadline') || q.includes('timer') || q.includes('countdown') || q.includes('breach') || q.includes('overdue')) {
      return {
        id,
        sender: 'bot',
        text: `⏱️ **Understanding the Complaint SLA Tracker:**\n\nSLA stands for **Service Level Agreement** — it's the promised timeframe within which a customer grievance must be addressed.\n\nComplaintSense automatically assigns an SLA target based on complaint urgency:\n- **Critical Urgency**: **4 Hours** target (legal threats, severe safety, large financial loss)\n- **High Urgency**: **12 Hours** target (delayed deliveries, account lockouts)\n- **Medium Urgency**: **24 Hours** target (routine billing queries, feature defects)\n- **Low Urgency**: **48 Hours** target (general inquiries, feedback)\n\n**Visual Indicators:**\n- 🔵 **Within SLA Target**: Still within the safe resolution window.\n- 🔴 **SLA Breached**: Ticket has exceeded its target and needs immediate attention.\n- 🔵 **Resolved in SLA**: Successfully closed before the deadline!\n\n*Tip: Check the **Executive Overview** page to see real-time critical tickets nearing SLA limits.*`,
        action: {
          label: 'View Urgent Complaints',
          tab: 'complaints',
        },
        timestamp,
      };
    }

    // 2. Reviewing and Resolving a Complaint
    if (q.includes('resolve') || q.includes('review') || q.includes('close ticket') || q.includes('answer') || q.includes('reply') || q.includes('draft')) {
      return {
        id,
        sender: 'bot',
        text: `✅ **How to Review & Resolve a Complaint (Step-by-Step):**\n\n1. Go to the **Complaints** page and click any ticket row.\n2. In the **Complaint Detail Dossier**, review:\n   - **Customer Message** on the left.\n   - **AI Analysis**: Detected category, sentiment, and urgency score.\n   - **Grounded Policy**: Which internal company rule applies.\n3. Scroll to the **Response Assistant** card (bottom right).\n4. Select a tone style: **Professional**, **Empathetic**, **Concise**, or **Formal**.\n5. Review or edit the drafted response text in the box.\n6. Click **Approve Draft** to record human sign-off, or click **Mark Resolved** to finish and close the ticket!`,
        action: {
          label: 'Open Complaints List',
          tab: 'complaints',
        },
        timestamp,
      };
    }

    // 3. Duplicate Complaint Detection
    if (q.includes('duplicate') || q.includes('repeat') || q.includes('similar') || q.includes('mirror') || q.includes('match')) {
      return {
        id,
        sender: 'bot',
        text: `🔍 **How Duplicate Complaint Detection Works:**\n\nComplaintSense automatically compares every incoming complaint against historical records using semantic similarity:\n\n- If a complaint has **$\ge 82\%$ similarity** with an existing ticket from the same customer or topic, an **Amber Alert Banner** appears at the top of the ticket.\n- The alert shows the matching ticket number, customer name, date, and percentage match.\n- Click **"View Parent Complaint"** to instantly open the original ticket.\n\n**Why this helps you:**\nIt prevents your support team from doing double work and reveals customers who submit repeated tickets about the same ongoing problem!`,
        action: {
          label: 'Explore Complaints',
          tab: 'complaints',
        },
        timestamp,
      };
    }

    // 4. CSV Import & Bulk Upload
    if (q.includes('csv') || q.includes('upload') || q.includes('import') || q.includes('spreadsheet') || q.includes('excel') || q.includes('bulk')) {
      return {
        id,
        sender: 'bot',
        text: `📁 **How to Import Complaints from CSV:**\n\n1. Click the **"Import CSV"** button located at the top-right of the **Complaints** page.\n2. A modal will pop up. You can click **"Download CSV Template"** to see the exact columns needed.\n3. Ensure your spreadsheet contains these columns:\n   - \`customer_name\`\n   - \`customer_email\`\n   - \`subject\`\n   - \`message\` (the customer's grievance text)\n   - *(Optional: \`channel\`, \`category\`)*\n4. Select or drag & drop your \`.csv\` file.\n5. Click **"Validate & Preview"** to inspect the data.\n6. Click **"Confirm Import"** to ingest the complaints. The AI will immediately categorize them, calculate urgency, and run similarity checks!`,
        action: {
          label: 'Go to Complaints Page to Import',
          tab: 'complaints',
        },
        timestamp,
      };
    }

    // 5. Needs Review Queue
    if (q.includes('needs review') || q.includes('confidence') || q.includes('uncertain') || q.includes('low conf')) {
      return {
        id,
        sender: 'bot',
        text: `⚠️ **What the 'Needs Review' Queue Is:**\n\nWhen ComplaintSense classifies a complaint, it calculates a **confidence percentage** (0% to 100%).\n\n- If the AI is **less than 75% confident** in its prediction (for example, if the customer's text is very ambiguous or mentions multiple unrelated issues), the ticket is flagged with **Needs Review**.\n- You can see all of these in the **Needs Review** tab on the Complaints page.\n- When you open the ticket and click **"Correct Classification"**, your manual correction is logged as audit feedback to help improve future accuracy!`,
        action: {
          label: 'Open Needs Review Queue',
          tab: 'complaints',
        },
        timestamp,
      };
    }

    // 6. Knowledge Base & SOPs
    if (q.includes('sop') || q.includes('knowledge') || q.includes('policy') || q.includes('document') || q.includes('gap')) {
      return {
        id,
        sender: 'bot',
        text: `📚 **Managing Knowledge Base SOPs & Policy Documents:**\n\nComplaintSense uses company Standard Operating Procedures (SOPs) to ground its suggested responses.\n\n**To add a new policy:**\n1. Click **Knowledge Base** in the left menu.\n2. Click the **"+ Add Policy SOP"** button.\n3. Enter the document title, category, and policy rules.\n4. Click **Save Policy**. The AI will instantly index it!\n\n**Knowledge Gap Detection:**\nAt the top of the Knowledge Base page, look for the **"Knowledge Gap Detected"** banner. If customers frequently complain about an issue that has no policy coverage, ComplaintSense alerts you and lets you click **"Draft SOP"** to automatically generate an internal procedure!`,
        action: {
          label: 'Open Knowledge Base',
          tab: 'knowledge',
        },
        timestamp,
      };
    }

    // 7. Sentiment & Urgency
    if (q.includes('sentiment') || q.includes('urgency') || q.includes('score') || q.includes('tone') || q.includes('vader') || q.includes('emotion')) {
      return {
        id,
        sender: 'bot',
        text: `📊 **How Sentiment & Urgency Scores Work (Plain English):**\n\n- **Sentiment (Emotional Mood)**:\n  - 🔴 **Negative**: Customer is angry, disappointed, or frustrated (e.g., "awful service", "package destroyed").\n  - ⚪ **Neutral**: Customer is asking a matter-of-fact question.\n  - 🔵 **Positive**: Customer is expressing appreciation or relief.\n\n- **Urgency Score (0 to 100)**:\n  - Scored based on detectable business risk signals:\n  - **Legal Threat**: "lawyer", "attorney", "court"\n  - **Time-Critical**: "immediately", "deadline", "urgent"\n  - **Repeated Incident**: "third time", "repeatedly"\n  - **Financial Impact**: unauthorized charges or refunds over threshold\n  - High scores push tickets to the top of your queue so you never miss a fire!`,
        action: {
          label: 'View Intelligence Dashboard',
          tab: 'intelligence',
        },
        timestamp,
      };
    }

    // 8. Escalation
    if (q.includes('escalat') || q.includes('supervisor') || q.includes('manager') || q.includes('urgent')) {
      return {
        id,
        sender: 'bot',
        text: `🚨 **When and How to Escalate a Complaint:**\n\n**When to escalate:**\n- The customer has issued a legal or regulatory complaint threat.\n- Financial loss exceeds your team's standard refund authorization limit.\n- Recurring systemic failure affecting many customers at once (e.g., regional carrier outage).\n\n**How to escalate:**\n1. Open the complaint dossier.\n2. Click the **"Escalate"** button in the top action bar.\n3. Enter the specific operational reason (e.g., *"Repeated logistics delay in Mumbai; customer threatening legal action"*).\n4. Click **Confirm Escalation**. The status changes to **ESCALATED** and highlights in red across the executive dashboard!`,
        action: {
          label: 'View Open Complaints',
          tab: 'complaints',
        },
        timestamp,
      };
    }

    // 9. Playbooks
    if (q.includes('playbook') || q.includes('checklist') || q.includes('step') || q.includes('procedure')) {
      return {
        id,
        sender: 'bot',
        text: `📋 **Interactive Resolution Playbooks:**\n\nEvery complaint detail view includes a **Resolution Playbook** tailored to that ticket's specific category (e.g. Logistics, Billing, Product Defect):\n\n- It acts as an interactive checklist of required company actions (e.g. *audit carrier scan telemetry*, *verify payment ledger*, *dispatch replacement unit*).\n- As you or your agents perform each step, simply click the checkbox to mark it complete.\n- Progress updates in real-time (e.g., \`3/5 Completed\`) so nothing slips through the cracks!`,
        action: {
          label: 'View a Complaint to Try Playbooks',
          tab: 'complaints',
        },
        timestamp,
      };
    }

    // 10. Demo Workspaces & Resetting
    if (q.includes('workspace') || q.includes('company') || q.includes('reset') || q.includes('demo') || q.includes('backup')) {
      return {
        id,
        sender: 'bot',
        text: `🏢 **Workspaces & Demo Companies:**\n\nComplaintSense comes with 4 preloaded industry demo workspaces:\n- **ShopEase** (E-Commerce — featuring the signature Mumbai delivery delay cluster)\n- **CloudDesk** (SaaS & IT)\n- **QuickShip** (Logistics & Freight)\n- **ConnectTel** (Telecommunications)\n\n**Quick Tips:**\n- To switch companies, click the **Workspace Switcher** in the left sidebar or the top header.\n- To restore all sample complaints back to their pristine seed state, click the **"Reset Demo"** button in the top bar!\n- You can also backup or export data in the **Settings** page.`,
        action: {
          label: 'Go to Settings',
          tab: 'settings',
        },
        timestamp,
      };
    }

    // Default Fallback
    return {
      id,
      sender: 'bot',
      text: `💡 **Here is what I can help you with:**\n\nI didn't quite catch that, but here are the most common things non-tech admins ask me:\n\n- **"How do I resolve a complaint?"** — 6-step agent resolution workflow\n- **"What does the SLA Tracker mean?"** — Urgency targets & breach deadlines\n- **"How do I upload a CSV?"** — Ingesting customer spreadsheets\n- **"Explain duplicate complaints"** — 82%+ matching & parent linking\n- **"What is Needs Review?"** — Low-confidence review queue\n- **"How to add SOPs?"** — Managing company policies & knowledge gaps\n\nTry clicking any of the quick prompt buttons below, or ask me directly!`,
      timestamp,
    };
  };

  const handleActionClick = (action?: { label: string; tab?: string; callback?: () => void }) => {
    if (!action) return;
    if (action.callback) {
      action.callback();
    } else if (action.tab) {
      onNavigateTab(action.tab);
    }
    // Optionally minimize chat on mobile when navigating
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* ================= FLOATING ACTION BUTTON ================= */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-5 right-5 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0F2A5F] hover:bg-[#163A7A] text-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-400/40 hover:scale-105 cursor-pointer min-h-[48px]"
          title="Open ComplaintSense Admin Helper"
          aria-label="Open ComplaintSense Admin Helper"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-blue-200 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            Admin Helper
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-blue-500/30 rounded text-blue-200 border border-blue-400/30">
            Guide
          </span>
        </button>
      )}

      {/* ================= CHATBOT MODAL / WINDOW ================= */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl border border-slate-200 dark:border-[#23364D] bg-white dark:bg-[#0D1B2A] flex flex-col ${
            isMinimized
              ? 'bottom-5 right-5 w-72 sm:w-80 h-14 rounded-2xl overflow-hidden'
              : 'bottom-4 right-4 sm:bottom-5 sm:right-5 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl overflow-hidden'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-[#0F2A5F] dark:bg-[#0A1828] text-white px-4 py-3.5 flex items-center justify-between border-b border-blue-900/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white">Admin Helper Copilot</h3>
                  <span className="w-2 h-2 rounded-full bg-blue-400" title="Online" />
                </div>
                <p className="text-[10px] text-blue-200/80 leading-none">Non-tech admin guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close helper"
                aria-label="Close helper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Visible when not minimized) */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs sm:text-sm bg-slate-50/50 dark:bg-[#07111F]/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-3 shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#0F2A5F] dark:bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-[#13263A] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#23364D] rounded-bl-xs'
                      }`}
                    >
                      {/* Markdown-like simple rendering */}
                      <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                        {msg.text.split('\n').map((line, lIdx) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <p key={lIdx} className="font-bold text-slate-900 dark:text-white">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            );
                          }
                          return (
                            <p key={lIdx}>
                              {line.split('**').map((seg, sIdx) =>
                                sIdx % 2 === 1 ? <strong key={sIdx} className="font-bold">{seg}</strong> : seg
                              )}
                            </p>
                          );
                        })}
                      </div>

                      {/* Optional Direct Action Link */}
                      {msg.action && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-[#23364D]">
                          <button
                            onClick={() => handleActionClick(msg.action)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer text-xs"
                          >
                            <span>{msg.action.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {/* Simulated typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#13263A] border border-slate-200 dark:border-[#23364D] w-24">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Topics Carousel / Chips */}
              <div className="px-3 py-2 bg-white dark:bg-[#0D1B2A] border-t border-slate-200 dark:border-[#23364D] shrink-0">
                <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span>Quick Admin Guides:</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleSendMessage(topic.query)}
                      className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#13263A] text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-[#23364D] transition cursor-pointer shrink-0"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white dark:bg-[#0D1B2A] border-t border-slate-200 dark:border-[#23364D] shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask how to do anything in ComplaintSense..."
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-40 transition cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center shrink-0"
                    title="Send question"
                    aria-label="Send question"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
