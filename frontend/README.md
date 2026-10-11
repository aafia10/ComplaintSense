# ComplaintSense Frontend UI (`complaintsense-ui`)

> Modern, responsive, B2B SaaS Customer Complaint Intelligence Platform interface built with React 19, TypeScript, Vite, and Tailwind CSS.

---

## 1. Overview

The `complaintsense-ui` application provides support executives, customer operations managers, and non-technical administrators with a clear, actionable dashboard to triage complaints, monitor SLA compliance, inspect root-cause intelligence, and draft grounded responses.

The frontend is built to be:
- **Clean & Modern**: Strict Navy-Blue & White aesthetic with full Dark Mode support.
- **Enterprise-Grade**: Zero green/emerald styling, consistent typography scale, high-contrast badges, and readable charts.
- **Responsive & Accessible**: Compatible across mobile phones, tablets, laptops, and ultra-wide desktop monitors with zero horizontal scrolling.
- **Human-in-the-Loop**: Transparent AI explanations, low-confidence review queues, and editable response drafts.
- **Admin-Friendly**: Equipped with an embedded **Admin Helper Chatbot** tailored specifically for non-technical administrators.

---

## 2. Strict Navy-Blue & White Design System

The application strictly adheres to an authoritative B2B SaaS palette:

| Token | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Navy** | `#0F2A5F` | `#0D1B2A` | Top navigation, primary CTAs, table headers, chatbot header |
| **Brand Navy** | `#163A7A` | `#13263A` | Button hover states, secondary surface panels |
| **Accent Blue** | `#2563EB` | `#3B82F6` | Active route indicators, focused states, primary links |
| **Page Background**| `#F8FAFC` | `#07111F` | Main viewport canvas |
| **Card Surface** | `#FFFFFF` | `#0D1B2A` | KPI cards, dossier panels, modal dialogs |
| **Borders** | `#E2E8F0` | `#23364D` | Subtle panel dividers, input borders |
| **Primary Text** | `#0F172A` | `#F8FAFC` | Headings, KPI numbers, primary data cells |
| **Muted Text** | `#64748B` | `#94A3B8` | Metadata (13px), timestamps, helper descriptions |

### Dark Theme Engine
- Managed globally via `ThemeContext.tsx` (`light` | `dark`).
- Synchronizes with system preferences and persists user preference in `localStorage` under `complaintsense-theme`.
- Instantly switchable via the Sun/Moon icon in the TopBar.

### Typography & Spacing Hierarchy
- **Base Root Font**: 16px for comfortable long-form readability.
- **KPI Metrics**: 28px–36px bold tabular figures.
- **Table Data & Labels**: 14px high-contrast text.
- **Metadata & Subtext**: 13px clean muted text.
- **Touch Targets**: Minimum 44px $\times$ 44px on all interactive mobile buttons and links.

---

## 3. Page Structure & Features

```text
src/
├── api/
│   └── client.ts             # Typed REST fetch client for FastAPI backend
├── components/
│   ├── AdminHelperChatbot.tsx# Embedded non-tech admin copilot with quick topic chips
│   ├── AppLayout.tsx         # Responsive application shell & chatbot coordinator
│   ├── Sidebar.tsx           # Persistent desktop sidebar & mobile slide-out drawer
│   ├── TopBar.tsx            # Breadcrumbs, workspace switcher, demo reset, theme toggle
│   ├── CsvImportModal.tsx    # 3-step CSV upload, preview, and batch ingestion dialog
│   ├── NewComplaintModal.tsx # Single grievance intake dialog with real-time NLP
│   └── DemoModal.tsx         # Preloaded sample scenario walkthrough selector
├── context/
│   └── ThemeContext.tsx      # Dark mode state provider with local persistence
├── pages/
│   ├── OverviewPage.tsx      # Executive dashboard with 7d/30d/90d KPI trends
│   ├── ComplaintsPage.tsx    # 8-column data grid, mobile cards, Needs Review queue
│   ├── ComplaintDetailPage.tsx # Dossier, SLA tracker, lifecycle stepper, playbooks
│   ├── IntelligencePage.tsx  # Shift trends, recurring clusters, products & customers
│   ├── NLPLabPage.tsx        # TF-IDF explainability, model comparison, health
│   ├── KnowledgeBasePage.tsx # Gap detector, SOP drafter, policy browser
│   ├── SettingsPage.tsx      # Profile, departments, categories, SQLite backup
│   └── LandingPage.tsx       # B2B product showcase landing page
├── App.tsx                   # Main route switch and modal manager
├── index.css                 # Tailwind utilities, root fonts, scrollbar styles
└── main.tsx                  # Application entry point with ThemeProvider
```

### Feature Highlights

#### 🤖 Admin Helper Chatbot (`AdminHelperChatbot.tsx`)
- Floating copilot widget mounted globally in `AppLayout.tsx`.
- Designed specifically for non-technical administrators who need quick, plain-language guidance.
- Pre-loaded offline knowledge base answering questions about:
  - How to review and resolve customer tickets
  - How the SLA resolution timer works
  - How duplicate complaint detection operates
  - How to format and upload CSV spreadsheets
  - What the "Needs Review" queue means
  - How to add SOPs to fill knowledge gaps
  - What sentiment and urgency scores mean
  - When and how to escalate complaints
  - How to use Resolution Playbook checklists
- Features 1-click in-chat navigation buttons to immediately take the user to the relevant screen.

#### ⏱️ Complaint SLA Resolution Tracker (`ComplaintDetailPage.tsx`)
- Urgency-calibrated resolution deadlines:
  - Critical: **4 hours**
  - High: **12 hours**
  - Medium: **24 hours**
  - Low: **48 hours**
- Displays elapsed time, countdown to breach, overdue alerts, and animated progress bars.

#### 🔄 Complaint Lifecycle Timeline (`ComplaintDetailPage.tsx`)
- Visual 6-stage stepper showing the progression of each complaint:
  `Ingested` $\to$ `NLP Analyzed` $\to$ `Auto-Routed` $\to$ `Draft Generated` $\to$ `Human Review` $\to$ `Resolved`.

#### 📋 Interactive Resolution Playbooks (`ComplaintDetailPage.tsx`)
- Interactive, category-tailored standard operating procedure checklists.
- Agents can check off steps as they complete them with real-time progress indicators (e.g., `3/5 Completed`).

#### 🔍 Duplicate Complaint Detection (`ComplaintDetailPage.tsx`)
- Flags complaints with $\ge 82\%$ semantic similarity to existing records.
- Provides an alert banner with a direct 1-click button to inspect the parent ticket.

#### ⚠️ Low-Confidence Review Queue (`ComplaintsPage.tsx`)
- Dedicated `Needs Review` tab filtering tickets where classification confidence is under 75%.
- Enables human feedback corrections that train local models.

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20 and 22)
- npm 9+

### Installation
From the `frontend` directory:
```bash
npm install
```

### Development Server
Run the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser to: `http://localhost:5173`.

### Production Build
Verify TypeScript types and build minified production bundles:
```bash
npm run build
```
Built artifacts will be output to `frontend/dist/`.

### Preview Production Build
Preview the generated production build locally:
```bash
npm run preview
```

---

## 5. Connecting to the Backend

By default, the frontend connects to the FastAPI backend running at:
`http://localhost:8000/api`

To change the backend endpoint, update `API_BASE` in [src/api/client.ts](file:///d:/ComplaintSense/frontend/src/api/client.ts):
```typescript
const API_BASE = "http://localhost:8000/api";
```

---

## 6. License

This project is licensed under the MIT License — see the root [LICENSE](../LICENSE) file for details.
