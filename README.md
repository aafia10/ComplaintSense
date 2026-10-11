# ComplaintSense: An NLP-Based Customer Complaint Intelligence, Analysis and Resolution Platform

> **Product Tagline**: Turn customer complaints into actionable intelligence.

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg)](https://scikit-learn.org/)
[![NLTK](https://img.shields.io/badge/NLTK-3.8+-green.svg)](https://www.nltk.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary & Vision

**ComplaintSense** is a full-stack, SaaS-architected, 100% free and local MVP designed to bridge the gap between customer support operations and executive decision-making. 

Traditional customer support systems operate on a rigid routing paradigm:
```
Customer Complaint ───► Department ───► Ticket Close
```
This conventional approach treats every complaint as an isolated transactional chore, blinding organizations to systemic operational flaws.

**ComplaintSense shifts the focus from ticket routing to Complaint Intelligence:**
```
Customer Complaint
        │
        ├──► Understand (Topic, Intent, Sentiment, Urgency Signals, NER)
        │
        ├──► Discover (Similarity, Recurring Clusters, Time Trends, Root-Cause Patterns)
        │
        └──► Act (SLA Tracking, Playbooks, Department Recommendation, Human-Reviewed Response)
```

The platform answers critical business questions:
- *What is the customer actually complaining about?*
- *What does the customer want done (topic vs. underlying intent)?*
- *What is the emotional tone and urgency of the customer's language?*
- *Are there other similar complaints occurring across the company?*
- *Is this issue emerging into a trend, and what is the probable operational root cause?*
- *What does corporate policy dictate, and what empathetic response draft can assist the support agent?*
- *How can a non-technical administrator easily operate, navigate, and manage the platform without technical complexity?*

---

## 2. 100% Free & Local Architecture

ComplaintSense is built specifically to execute on a standard laptop with zero paid API subscriptions or enterprise cloud databases:
- **No Paid APIs**: No OpenAI, Anthropic, Claude, Gemini, Groq, Twilio, or WhatsApp API requirements.
- **Local Machine Learning**: Scikit-learn (Multinomial Naive Bayes, Logistic Regression, Linear SVM) and NLTK (VADER sentiment analysis, WordNet lemmatizer, tokenizers).
- **Embedded Database**: Local SQLite (`complaintsense.db`) with SQLAlchemy ORM structured with `workspace_id` for SaaS multi-tenancy.
- **Zero Cloud Vector Databases**: Semantic similarity and local knowledge retrieval are powered entirely by offline TF-IDF and cosine similarity engines.
- **Embedded Admin Copilot**: Local, offline helper chatbot assisting administrators with zero external network overhead.
- **No Docker Required**: Native, lightweight startup via Python virtual environments and Vite.

---

## 3. High-Level Architecture

```mermaid
graph TD
    User["Customer / Support Agent / Non-Tech Admin"] --> Frontend["React + Vite + TypeScript + Tailwind UI (Port 5173)"]
    Frontend --> API["FastAPI REST Backend (Port 8000)"]
    
    subgraph "Frontend Layer"
        Frontend --> Chatbot["Admin Helper Chatbot (Plain-English Copilot)"]
        Frontend --> Theme["Theme Engine (Navy & White / Dark Navy)"]
        Frontend --> Views["Executive Overview | Complaints | Intelligence | KB | NLP Lab"]
    end

    subgraph "Backend Services Layer"
        API --> DB[("SQLite Database (complaintsense.db)")]
        API --> NLPEngine["Core NLP Pipeline Engine"]
        API --> IntelEngine["Intelligence Engine (Clusters, Trends, Root Cause)"]
        API --> ResolutionEngine["Resolution & Response Generator"]
        API --> KnowledgeEngine["Local Knowledge Base (TF-IDF Retrieval)"]
    end

    subgraph "NLP & ML Pipeline"
        NLPEngine --> Preprocess["Preprocessing (Tokens, Stopwords, Lemmatization)"]
        NLPEngine --> Classifiers["Issue Classifiers (NB, LogReg, Linear SVM)"]
        NLPEngine --> IntentDetector["Intent Detection Engine"]
        NLPEngine --> SentimentUrgency["VADER Sentiment & Signal-Based Urgency (0-100)"]
        NLPEngine --> NER["Hybrid NER (Regex + Pattern Matcher)"]
        NLPEngine --> Similarity["TF-IDF Cosine Similarity Search"]
    end
```

---

## 4. Key SaaS Features & Workflow Capabilities

### 🤖 1. Admin Helper Chatbot (For Non-Technical Administrators)
- **Plain-English Copilot**: Floating assistant widget accessible globally across all views (`fixed bottom-5 right-5`).
- **Zero Technical Jargon**: Explains complex NLP concepts (confidence thresholds, sentiment scores, vector similarity) in simple business language.
- **One-Click Quick Topic Chips**:
  - *How to Resolve a Ticket* (6-step guided walkthrough)
  - *Understanding SLA Deadlines* (Urgency levels & breach targets)
  - *Duplicate Complaint Detection* (82%+ similarity matching & parent linking)
  - *Importing CSV Complaints* (Spreadsheet column format & upload)
  - *What is 'Needs Review'?* (Low-confidence queue & model feedback)
  - *Adding SOPs & Policies* (Knowledge Base gap filling)
  - *Sentiment & Urgency Scores* (Plain explanation of emotional tones)
  - *When to Escalate* (Executive & operational escalation rules)
  - *Resolution Playbooks* (Interactive SOP checklists)
- **Direct 1-Click Navigation**: In-chat action buttons directly navigate the admin to the target view (e.g., *Open Complaints List*, *Open Knowledge Base*, *Go to Settings*).

### ⏱️ 2. Complaint SLA Resolution Tracker
- **Severity-Calibrated Deadlines**:
  - `Critical Urgency`: **4 Hours** target
  - `High Urgency`: **12 Hours** target
  - `Medium Urgency`: **24 Hours** target
  - `Low Urgency`: **48 Hours** target
- **Elapsed & Remaining Calculations**: Calculated in real-time from complaint timestamps.
- **Visual Status Badges**: Clear visual differentiation for *Within SLA Target*, *SLA Breached*, and *Resolved in SLA*.
- **Visual Progress Bar**: Real-time progress bar showing percentage of allotted SLA window elapsed.

### 🔄 3. Complaint Lifecycle Timeline
- **6-Stage Visual Stepper**:
  1. **Ingested**: Received, sanitized, and queued
  2. **NLP Analyzed**: Intent, emotion, and named entities extracted
  3. **Auto-Routed**: Department assignment determined
  4. **Draft Generated**: Policy-grounded draft synthesized
  5. **Human Review**: Agent inspection, tone adjustment, and approval
  6. **Resolved**: Final resolution delivered and ticket closed
- **Adaptive Step Highlighting**: Dynamically tracks progress based on ticket state, response draft approvals, and escalations.

### 📋 4. Interactive Complaint Resolution Playbooks
- **Category-Tailored SOP Checklists**:
  - **Delivery & Logistics**: Audit carrier API scans, check Mumbai hub delay thresholds, verify recipient availability, dispatch replacement/penalty claim.
  - **Billing & Refund**: Verify payment gateway webhook, audit duplicate ledger capture, check $100 refund threshold, issue credit note.
  - **Product Defect**: Inspect batch code, match defect registry, dispatch prepaid RMA label, schedule pickup.
  - **Technical Support**: Collect client logs, query knowledge base workarounds, verify credentials, escalate patch to Tier-2.
- **Interactive Checkboxes**: Administrators can check off steps as work progresses, displaying live progress counters (e.g., `3/5 Completed`).

### 🔍 5. Duplicate Complaint Detection
- **Semantic Cosine Similarity ($\ge 82\%$)**: Identifies repeated complaints from the same customer or identical grievances submitted in parallel.
- **Alert Banner & Parent Linking**: Displays match percentage, original ticket ID, submission date, and a direct 1-click button to view the parent complaint.

### ⚠️ 6. Low-Confidence Review Queue
- **Dedicated 'Needs Review' Tab**: Automatically filters complaints where classification confidence falls below 75%.
- **Human-in-the-Loop Feedback**: Agents correct categories or intents, logging structured drift feedback to retrain local ML models.

### 📚 7. Knowledge-Gap Detection & SOP Drafting
- **Automated Detection**: Flags recurring complaint clusters that lack high-similarity internal documentation ($\text{similarity} < 0.60$).
- **One-Click SOP Drafting**: Prepopulates an SOP creation dialog with suggested titles and actionable operational guidelines.

### 📁 8. CSV Bulk Import & Export
- **Spreadsheet Ingestion Modal**: Validation, column preview, error checking, and downloadable template support.
- **Full Database Export**: One-click SQLite backup streaming and CSV export via Settings.

### 🎨 9. Strict Navy-Blue & White Visual Identity + Dark Theme
- **Strict Brand Palette**: Standardized `#0F2A5F` (primary navy), `#163A7A` (brand navy), and `#2563EB` (accent blue) across all pages, charts, tables, and badges. **Zero green or emerald styling**.
- **Dark Mode Engine**: Persistent Dark Navy surfaces (`#07111F` / `#0D1B2A` / `#13263A`) with instant top-bar toggle and `localStorage` persistence.
- **Responsive Layout**: Mobile/tablet slide-out drawer navigation with backdrop blur, 44px+ touch targets, and zero horizontal scrolling.

---

## 5. Core NLP Pipeline

Every complaint ingested by ComplaintSense undergoes a transparent, explainable 10-step NLP pipeline:

```
Customer Complaint
        ↓
1. Text Preprocessing & Cleaning (HTML, URL removal, casing normalization)
        ↓
2. Tokenization, Stopwords Filtering & WordNet POS Lemmatization
        ↓
3. TF-IDF Feature Extraction (Unigrams + Bigrams, Sublinear TF)
        ↓
4. Issue Category Classification (Naive Bayes, Logistic Regression, Linear SVM)
        ↓
5. Customer Intent Detection (Topic vs Intent differentiation)
        ↓
6. VADER Sentiment Analysis & Support-Oriented Emotional Tone Classification
        ↓
7. Signal-Based Transparent Urgency Scoring (0–100: Legal, Time, Repeated, Financial, Safety)
        ↓
8. Hybrid Named Entity Recognition (ORDER_ID, MONEY, PRODUCT, LOCATION, EMAIL, PHONE)
        ↓
9. Historical Cosine Similarity Search (Top 5 matches in workspace)
        ↓
10. Local Policy Knowledge Retrieval & Context-Aware Human-in-the-Loop Response Drafting
```

---

## 6. Preconfigured Multi-Industry Demo Environments

To demonstrate generalizability, ComplaintSense ships with **4 fully populated demo company workspaces**, each containing 30–60 realistic complaints and 5 dedicated local policy documents:

| Company | Industry | Primary Complaint Categories | Sample Scenario |
| :--- | :--- | :--- | :--- |
| **ShopEase** | E-commerce | Delivery & Logistics, Billing & Refund, Product Defect, Account & Login | **Signature Demo Cluster**: Delivery delays in Mumbai linked to "SpeedFast Logistics / Express Delivery" (+35% increase). |
| **CloudDesk** | SaaS | Technical Support, Billing & Subscription, Account & Login, Legal | Gateway 504 timeouts on CSV exports, SSO SAML lockouts, and duplicate enterprise seat charges. |
| **QuickShip** | Logistics | Delivery Delays, Damaged Freight, Address Rerouting, Billing & Claims | Damaged outer cartons, highway delays, and volumetric weight disputes. |
| **ConnectTel** | Telecommunications | Network Signal, Fiber Broadband Outage, Recharge Disputes, SIM/eSIM | Blinking red LOS fiber router lights, degraded 5G cellular sites, and failed UPI recharges. |

### The Signature Demonstration Scenario (ShopEase)
In **ShopEase**, an intentional cluster of complaints highlights delayed deliveries in Mumbai fulfilled by *SpeedFast Logistics*. 
When opening the **Executive Overview** or **Intelligence Hub** page, the system automatically detects:
- **Emerging Issue**: Delivery Delays (+35% trend increase).
- **Possible Pattern**: Co-occurrence of *SpeedFast Logistics* shipments in *Mumbai*.
- **Most Affected Location**: *Mumbai*.
- **Recommended Action**: Audit *SpeedFast Logistics* transit times and hub sorting operations in Mumbai.

> **Methodological Note on Root Cause Analysis**: ComplaintSense transparently labels all root-cause findings as **"Possible root-cause patterns"** or **"Associated recurring factors"**. The system detects statistical and linguistic co-occurrences in customer language, avoiding unfounded causal claims.

---

## 7. Project Structure

```text
complaintsense/
├── backend/
│   ├── app/
│   │   ├── api/                  # REST API routers (workspaces, tickets, intelligence, data, etc.)
│   │   │   ├── tickets.py        # Ticket endpoints with feedback, duplicate check, tone selector
│   │   │   ├── intelligence.py   # Overview (7d/30d/90d), products, customers, trends
│   │   │   ├── knowledge.py      # Knowledge documents and automated gap detector
│   │   │   ├── evaluation.py     # Model comparisons, explainability, model health
│   │   │   └── data.py           # DB backup, CSV export, validation & bulk ingestion
│   │   ├── database/             # SQLite connection and session management
│   │   ├── models/               # SQLAlchemy ORM models (Workspace, Ticket, FeedbackRecord, etc.)
│   │   ├── repositories/         # Decoupled data access layer:
│   │   │   ├── base.py           # Generic BaseRepository with pagination & filtering
│   │   │   ├── ticket_repository.py # Ticket queries, period-over-period stats, low-confidence
│   │   │   ├── workspace_repository.py # Multi-tenant workspace management
│   │   │   ├── knowledge_repository.py # Knowledge document CRUD & search
│   │   │   └── feedback_repository.py  # Human feedback audit trail & metrics
│   │   ├── schemas/              # Pydantic request and response schemas
│   │   ├── services/             # Core business logic and NLP ticket orchestration
│   │   ├── nlp/                  # Modular NLP implementations:
│   │   │   ├── preprocessing.py  # Cleaning, tokenizing, stopwords, lemmatizing
│   │   │   ├── tfidf.py          # Vectorizer configuration and vocabulary extraction
│   │   │   ├── classification.py # Naive Bayes, Logistic Regression, Linear SVM
│   │   │   ├── explainability.py # Top TF-IDF drivers, logit contributions & rule factors
│   │   │   ├── duplicates.py     # Cosine duplicate detection engine (threshold >= 0.82)
│   │   │   ├── intent.py         # Topic vs Intent disambiguation engine
│   │   │   ├── sentiment.py      # VADER polarity & emotional tone mapping
│   │   │   ├── urgency.py        # Transparent 0-100 urgency signal engine
│   │   │   ├── ner.py            # Hybrid Named Entity Recognition
│   │   │   └── similarity.py     # TF-IDF cosine similarity search
│   │   ├── intelligence/         # Clustering, trends, root cause, product & customer risk
│   │   │   ├── products.py       # Product defect rate & return risk scoring
│   │   │   └── customers.py      # Churn risk & repeat complainant intelligence
│   │   ├── routing/              # Department recommendation mapping
│   │   ├── knowledge/            # Local TF-IDF policy retrieval & gap detector
│   │   │   ├── retriever.py      # Context-grounded policy snippet extraction
│   │   │   └── gap_detector.py   # Uncovered complaint cluster identification & SOP drafts
│   │   ├── response_generator/   # Local empathetic template response builder:
│   │   │   └── generator.py      # Multi-tone generation & real-time quality validation
│   │   └── main.py               # FastAPI entry point with CORS middleware
│   ├── tests/                    # Automated pytest suite (NLP, intelligence, API, enhancements)
│   ├── run_tests.py              # Programmatic test runner script
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/client.ts         # TypeScript API fetch client and schema types
│   │   ├── components/           # AppLayout, Sidebar, TopBar, AdminHelperChatbot, Modals
│   │   │   ├── AdminHelperChatbot.tsx # Non-tech admin copilot with quick topic chips
│   │   │   ├── AppLayout.tsx     # Shell layout with responsive drawer & embedded copilot
│   │   │   ├── Sidebar.tsx       # Persistent desktop sidebar & mobile drawer
│   │   │   ├── TopBar.tsx        # Breadcrumbs, workspace switcher, theme toggle
│   │   │   └── CsvImportModal.tsx# CSV preview & batch ingestion dialog
│   │   ├── context/
│   │   │   └── ThemeContext.tsx  # Light/Dark mode state with localStorage persistence
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx  # Executive dashboard with 7d/30d/90d period KPIs
│   │   │   ├── ComplaintsPage.tsx# 8-column table, mobile stacked cards, Needs Review tab
│   │   │   ├── ComplaintDetailPage.tsx # Dossier, SLA tracker, lifecycle timeline, playbooks
│   │   │   ├── IntelligencePage.tsx    # Shift trends, recurring issues, products & customers
│   │   │   ├── NLPLabPage.tsx          # Model comparison, confusion matrix, health
│   │   │   ├── KnowledgeBasePage.tsx   # Gap detector, SOP drafter, document browser
│   │   │   ├── SettingsPage.tsx        # Profile, categories, departments, Data Operations
│   │   │   └── LandingPage.tsx   # SaaS landing page with dark blue theme
│   │   ├── App.tsx               # Route controller and modal coordinators
│   │   ├── index.css             # Base styles, 16px root typography, scrollbars
│   │   └── main.tsx              # React DOM root with ThemeProvider
│   ├── package.json              # complaintsense-ui package
│   └── tsconfig.json
├── knowledge_base/               # Local policy documents across demo companies
├── models/                       # Serialized joblib classifiers and TF-IDF vectorizer
├── evaluation/                   # Saved empirical evaluation metrics (metrics.json)
├── scripts/
│   ├── train_classifier.py       # Trains Naive Bayes, Logistic Regression, Linear SVM
│   ├── evaluate_models.py        # Computes cross-validated precision, recall, F1, CM
│   └── seed_demo.py              # Seeds companies, trains models, runs NLP pipeline
├── complaintsense.db             # Local SQLite database
└── README.md
```

---

## 8. Quickstart Installation Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.11, 3.12, 3.13)
- Node.js 18+ and npm

### Step 1: Clone the Repository
```bash
git clone https://github.com/aafia10/ComplaintSense.git
cd ComplaintSense
```

### Step 2: Backend Setup
```bash
cd backend

# Create dedicated virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Seed Demo Data & Train NLP Models
From the project root:
```bash
# Windows:
backend\venv\Scripts\python scripts/seed_demo.py

# macOS/Linux:
# backend/venv/bin/python scripts/seed_demo.py
```
*This command initializes `complaintsense.db`, trains the 3 machine learning classifiers, generates evaluation metrics, and executes the complete NLP pipeline on 176+ demo records.*

### Step 4: Run the Backend Server
```bash
cd backend
# Windows:
venv\Scripts\uvicorn app.main:app --reload --port 8000
# macOS/Linux:
# venv/bin/uvicorn app.main:app --reload --port 8000
```
*The FastAPI backend will be available at: `http://localhost:8000` (Swagger docs at `/docs`).*

### Step 5: Frontend Setup & Run
Open a new terminal:
```bash
cd frontend

# Install npm packages
npm install

# Start development server
npm run dev
```
*The frontend will launch at: `http://localhost:5173`.*

---

## 9. Automated Verification & Testing

To run the automated backend test suite covering NLP modules, intelligence calculations, repositories, feedback, explainability, response quality, and API endpoints:
```bash
# From project root:
backend\venv\Scripts\python backend/run_tests.py
```
*(Or directly run `pytest tests -v` inside `backend` with the active venv).*

Expected result:
```text
============================= test session starts =============================
platform win32 -- Python 3.13.9, pytest-9.1.1, pluggy-1.6.0
collected 21 items

backend/tests/test_api.py::test_api_root PASSED                          [  4%]
backend/tests/test_api.py::test_get_workspaces PASSED                    [  9%]
backend/tests/test_api.py::test_get_dashboard_stats PASSED               [ 14%]
backend/tests/test_api.py::test_create_and_fetch_ticket PASSED           [ 19%]
backend/tests/test_api.py::test_evaluation_metrics PASSED                [ 23%]
backend/tests/test_enhancements.py::test_ticket_repository_kpis PASSED   [ 28%]
backend/tests/test_enhancements.py::test_duplicate_detection PASSED      [ 33%]
backend/tests/test_enhancements.py::test_nlp_explainability PASSED       [ 38%]
backend/tests/test_enhancements.py::test_response_tone_and_quality PASSED [ 42%]
backend/tests/test_enhancements.py::test_knowledge_gap_detector PASSED   [ 47%]
backend/tests/test_enhancements.py::test_feedback_repository PASSED      [ 52%]
backend/tests/test_intelligence.py::test_trend_calculation PASSED        [ 57%]
backend/tests/test_intelligence.py::test_period_over_period PASSED       [ 61%]
backend/tests/test_intelligence.py::test_root_cause_pattern PASSED       [ 66%]
backend/tests/test_nlp.py::test_preprocessing PASSED                     [ 71%]
backend/tests/test_nlp.py::test_sentiment_analysis PASSED                [ 76%]
backend/tests/test_nlp.py::test_urgency_signals PASSED                   [ 80%]
backend/tests/test_nlp.py::test_intent_detection PASSED                  [ 85%]
backend/tests/test_nlp.py::test_named_entity_recognition PASSED          [ 90%]
backend/tests/test_nlp.py::test_classification PASSED                    [ 95%]
backend/tests/test_nlp.py::test_similarity_search PASSED                 [100%]

====================== 21 passed in 27.76s =======================
```

To test the frontend production build:
```bash
cd frontend
npm run build
```
*(Produces a zero-error optimized bundle in `frontend/dist`).*

---

## 10. Model Evaluation & Metrics

ComplaintSense values academic honesty. Classifier metrics are generated from stratified cross-validation on real complaint text rather than fabricated placeholders.

### Cross-Validation Comparison
| Model | Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score (Weighted) |
| :--- | :---: | :---: | :---: | :---: |
| **Multinomial Naive Bayes** | 62.4% | 59.7% | 62.4% | 56.5% |
| **Logistic Regression** | 53.3% | 41.1% | 53.3% | 41.6% |
| **Linear SVM (Calibrated)** | **62.4%** | **55.5%** | **62.4%** | **55.1%** |

*Confusion matrices and class-level breakdown reports can be inspected visually on the **NLP Lab → Model Comparison / Confusion Matrix** tabs.*

---

## 11. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
