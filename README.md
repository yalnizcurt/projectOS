# ERP Delivery & Capacity Control Tower

> **A strategic operational control tower designed to eliminate ERP delivery bottlenecks, connect customer Go-Live commitments to real developer capacity, and align Sales, Consulting, Management, and Development teams.**

---

## 1. Product Overview & Purpose

In enterprise software delivery, a recurring operational disconnect often jeopardizes customer success:

**Sales and Consulting commit customer Go-Live dates before the ERP Integration team has visibility into technical effort, non-standard scope, existing commitments, or developer bandwidth.**

As a result, projects enter the pipeline with unachievable deadlines. The ERP development team becomes an unexpected downstream bottleneck, leading to delayed customer launches, strained delivery teams, last-minute developer reallocations, and costly escalations.

The **ERP Delivery & Capacity Control Tower** bridges this gap. It acts as the single operational source of truth answering five vital business questions at any point in the delivery lifecycle:

1. **What commitments have we made to our customers?**
2. **What technical work is required to deliver them (Standard $X$ vs. Non-Standard $\Delta X$)?**
3. **Who is assigned to do that work, and do they have bandwidth?**
4. **Where are our upcoming capacity deficits across the next 8 weeks?**
5. **Which customer commitments are currently at risk, and why?**

> **System-of-Record Principle:** The Control Tower does **not** replace Jira. Jira remains the task execution and sprint tracking system, while the Control Tower serves as the **delivery planning, capacity forecasting, commitment tracking, and risk governance layer**, synchronized bidirectionally with Jira.

---

## 2. User Personas

The platform is designed around five core organizational roles, each with tailored visibility and operational goals:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             ORGANIZATIONAL PERSONAS                              │
├─────────────────────┬────────────────────────────────────────────────────────────┤
│ 👔 ERP Manager      │ Team utilization, 8-week capacity forecasting, what-if     │
│                     │ staffing simulations, developer allocation & reassignments │
├─────────────────────┼────────────────────────────────────────────────────────────┤
│ 💻 ERP Developer    │ Personal workload cockpit, customer commitments, Jira task │
│                     │ execution, bandwidth visibility & hour tracking            │
├─────────────────────┼────────────────────────────────────────────────────────────┤
│ 🤝 Consulting Lead  │ Downstream project milestones, Go-Live feasibility, delivery│
│                     │ RAG risk tracking (strictly read-only on developer tasks)  │
├─────────────────────┼────────────────────────────────────────────────────────────┤
│ 📈 Sales Executive  │ Sizing new ERP deals using baseline formulas (X + ΔX),      │
│                     │ verifying team capacity before committing customer dates   │
├─────────────────────┼────────────────────────────────────────────────────────────┤
│ ⚙️ System Admin     │ Managing ERP baseline catalogs, default effort deltas,     │
│                     │ bidirectional Jira sync rules, and webhook simulators      │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

### 1. 👔 ERP Manager
- **Primary Goal:** Ensure high team throughput without burning out developers or missing customer delivery dates.
- **Key Responsibilities:**
  - Monitors forward-looking 8-week supply vs. demand curves to catch capacity deficits before projects start.
  - Rebalances developer workloads across projects using the interactive Heat Map reallocation drawer.
  - Runs What-If simulations to test allocation feasibility before approving customer schedules.
  - Investigates delivery risks (RED/AMBER projects) and initiates staffing interventions.

### 2. 💻 ERP Developer
- **Primary Goal:** Focus on task execution with complete clarity on customer priorities and realistic deadlines.
- **Key Responsibilities:**
  - Lands directly in a personalized Developer Workspace.
  - Sees assigned customer accounts, contractual Go-Live milestones, and project contacts.
  - Manages and updates linked Jira task execution statuses (`To Do` → `In Progress` → `Done`).
  - Monitors personal 8-week capacity to ensure they are not over-committed (>100%).

### 3. 🤝 Consulting / Delivery Lead
- **Primary Goal:** Protect downstream implementation milestones and maintain predictable customer Go-Live timelines.
- **Key Responsibilities:**
  - Tracks real-time ERP integration progress to coordinate dependent consulting workshops, data migrations, and UAT.
  - Reviews automated RAG badges and audit drivers to anticipate customer launch delays.
  - Reviews developer workloads in **Read-Only Mode** to understand bandwidth constraints without altering developer task states.

### 4. 📈 Sales Representative
- **Primary Goal:** Close customer contracts with realistic, deliverable ERP integration dates.
- **Key Responsibilities:**
  - Configures new ERP project proposals using standardized baseline integration effort ($X$).
  - Identifies non-standard ERP requirements to add necessary effort deltas ($\Delta X$).
  - Validates delivery feasibility against overall team capacity before signing customer commitments.

### 5. ⚙️ System Administrator
- **Primary Goal:** Maintain master catalog governance and seamless system integrations.
- **Key Responsibilities:**
  - Maintains the ERP Master Data catalog with standardized baseline days ($X$) and default deltas ($\Delta X$).
  - Monitors the health of the bidirectional Jira synchronization engine.
  - Tests webhook events and audits all changes made to project baselines and developer allocations.

---

## 3. Role-Based Access Control (RBAC) Matrix

Access permissions within the Control Tower are role-enforced to prevent unauthorized task tampering while maximizing transparency across departments:

| Feature / Screen | ERP Manager | ERP Developer | Consulting | Sales | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| **Executive Command Center** (`/`) | Full Access | — | View Only | View Only | Full Access |
| **Team Heat Map & Reallocation** (`/heatmap`) | Full Access | — | View Only | — | Full Access |
| **Project Portfolio** (`/portfolio`) | Full Access | View Assigned | Full Access | Full Access | Full Access |
| **Project Detail & Milestones** (`/project/:id`) | Full Access | View Assigned | View Only | View Only | Full Access |
| **Developer Workspace** (`/workspace`) | Full Access | **Edit Tasks** | **Read-Only** | — | Full Access |
| **What-If Capacity Simulator** | Full Access | — | — | Test Only | Full Access |
| **Create ERP Project** | Yes | — | Yes | Yes | Yes |
| **Reassign / Transfer Allocations** | Yes | — | — | — | Yes |
| **Jira Sync Engine & Webhook Simulator** | Full Access | — | View Only | — | Full Access |
| **ERP Master Data & Baseline Effort Catalog** | Full Access | — | — | — | Full Access |

> **Developer Workspace Edit Lock:** Developer Workspace actions (`Start`, `Done`, hours updates) are **strictly editable by ERP Developers** (and Admins/Managers for testing). When a Consulting Lead inspects a developer's workspace, the platform automatically switches to **Read-Only Mode**, displaying an informational notice and locking all task modification controls.

---

## 4. Product Screens & Capabilities

The user interface is consolidated into **5 primary screens** organized logically in the sidebar:

```
┌────────────────────────────────────────────────────────┐
│                   PRIMARY SCREENS                      │
├────────────────────────────────────────────────────────┤
│  1. 📊 Executive Command Center      → /               │
│  2. 🗓️ Team Availability Heat Map   → /heatmap        │
│  3. 📁 Project Portfolio & Detail    → /portfolio      │
│  4. 💻 Developer Workspace           → /workspace      │
│  5. ⚙️ Settings & Integrations       → /settings       │
└────────────────────────────────────────────────────────┘
```

---

### Screen 1: Executive Command Center (`/`)
*The high-level operational cockpit for engineering managers, delivery heads, and leadership.*

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [TOTAL PROJECTS: 12]  [UTILIZATION: 82%]  [OVERALLOCATED: 2]  [RISKS: 3]  [8-WK BUFFER: +24d]│
├────────────────────────────────────────────────────────┬────────────────────────────────┤
│ 📈 Team Supply vs Demand Forecast (8-Week Horizon)     │ 🎯 Delivery Risk Donut (RAG)   │
│ [Bar Chart View]  |  [Matrix Table View]               │    🟢 8 On Track (Green)       │
│                                                        │    🟡 2 At Risk (Amber)        │
│    Supply: 40 days/week baseline                       │    🔴 2 Critical (Red)         │
│    Demand: Planned project allocations per week        │                                │
├────────────────────────────────────────────────────────┴────────────────────────────────┤
│ 🚨 High-Attention Delivery Commitments   │ 🧮 What-If Allocation Simulator              │
│  • Apex Global - SAP S/4 (Committed: W4) │  Developer: [David Kim ▼]   Proj: [Apex ▼]  │
│  • Meridian Bio - Oracle (Committed: W5) │  Week: [Week 3 ▼]           Alloc: [40%]    │
│  [Full Portfolio (12) →]                 │  [Calculate Impact] → [Apply to Project]     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Capabilities:
- **Executive KPI Cards:** Instant metrics for Total Projects, Average Team Utilization, Overallocated Developers, Projects at Risk, and Forward 8-Week Net Capacity Balance.
- **Supply vs. Planned Demand Forecast (PRD §11):** 
  - Visualizes aggregate team work days available (Supply) versus project commitments (Demand) across an 8-week forward horizon.
  - Interactive toggle allows users to switch between the **ECharts Bar & Gap Line Chart** and the granular **Weekly Supply-Demand Matrix Table** (showing planned days, deficit flags, and overallocated headcounts).
- **Delivery Risk Distribution (PRD §17):** Real-time RAG donut displaying the deterministic health of all active customer integrations.
- **High-Attention Delivery Commitments:** Replaces redundant full-table clutter with a focused list of projects with active RED or AMBER risk triggers, accompanied by a direct link to the full portfolio.
- **What-If Allocation Impact Simulator (PRD §22):** 
  - Allows managers to pick any developer, project, target week, and proposed allocation percentage.
  - Previews utilization changes before committing: highlights whether the assignment is feasible or triggers an over-allocation alert (>40h/week).
  - One-click **Apply Allocation** immediately updates team schedules and audit history.

---

### Screen 2: Team Availability Heat Map (`/heatmap`)
*The visual capacity matrix for identifying developer availability, bottlenecks, and reallocating work.*

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Filters: [Search Developer...]  [Skill: All Skills ▼]  [Team: Core ERP ▼]               │
├───────────────────┬────────┬────────┬────────┬────────┬────────┬────────┬───────┬───────┤
│ Developer Name    │ Wk 1   │ Wk 2   │ Wk 3   │ Wk 4   │ Wk 5   │ Wk 6   │ Wk 7  │ Wk 8  │
├───────────────────┼────────┼────────┼────────┼────────┼────────┼────────┼───────┼───────┤
│ David Kim (SAP)   │  80%   │ 110% 🔴│  90%   │  40% 🟢│  80%   │  60%   │  0% 🟢│   0%  │
│ Sarah Chen (NetS) │  60%   │  80%   │ 100%   │  90%   │  40% 🟢│   0%   │   0%  │   0%  │
│ Alex Patel (D365) │ 120% 🔴│ 100%   │  75%   │  50%   │  20% 🟢│   0%   │   0%  │   0%  │
└───────────────────┴────────┴────────┴────────┴────────┴────────┴────────┴───────┴───────┘
  [Click any row to open Developer Drilldown & Reallocation Drawer →]
```

#### Key Capabilities:
- **8-Week Forward Utilization Matrix:** Visualizes every developer's workload across 8 future weeks using 40 hours/week as the 100% baseline.
- **Deterministic Color Coding:**
  - 🟢 **Available / Green (<75%):** Bandwidth available to take on new projects or ad-hoc consulting tasks.
  - 🟡 **Optimal / Amber (75%–100%):** Fully loaded with standard project work.
  - 🔴 **Overallocated / Red (>100%):** Overbooked; delivery date is at risk unless rebalanced.
- **Developer Drilldown Drawer:** Clicking any developer row slides out an in-depth profile:
  - Total allocated hours and free bandwidth for the selected week.
  - List of consuming projects.
  - **In-Drawer Reallocation Tool:** Reassign a specific project's percentage allocation from the overloaded developer to another qualified team member with immediate recalculation.

---

### Screen 3: Project Portfolio & Project Detail (`/portfolio`, `/project/:id`)
*The single source of truth for all ERP integrations, scope formulas, customer milestones, and audit history.*

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Search: [Quick search...]   Filters: [Customer ▼] [ERP System ▼] [RAG: All ▼] [+ New]   │
├───────────────────────┬────────────┬──────────┬──────────────┬─────────────┬────────────┤
│ Project & Customer    │ ERP System │ RAG      │ Effort (X+ΔX)│ Go-Live     │ Assigned   │
├───────────────────────┼────────────┼──────────┼──────────────┼─────────────┼────────────┤
│ Apex Global S/4HANA   │ SAP S/4    │ 🔴 RED   │ 15d + 10d    │ 2026-10-15  │ D. Kim     │
│ Meridian Bio Oracle   │ Oracle Net │ 🟡 AMBER │ 15d + 5d     │ 2026-10-22  │ S. Chen    │
│ Crestview Workday     │ Workday    │ 🟢 GREEN │ 10d + 0d     │ 2026-11-05  │ A. Patel   │
└───────────────────────┴────────────┴──────────┴──────────────┴─────────────┴────────────┘
```

#### Key Capabilities:
- **Formulaic Effort Sizing ($X + \Delta X$):** 
  - Clearly distinguishes **Standard Baseline Effort ($X$)** from **Non-Standard Scope Delta ($\Delta X$)** so scope creep is immediately visible.
- **Deterministic RAG Badging:**
  - Evaluated automatically by the system rather than relying on subjective status reports.
  - Hovering over a badge reveals the exact risk drivers (e.g., *Schedule Slip: Planned completion date exceeds customer commitment*, or *Missing Developer Allocation*).
- **New Project Registration Modal:** Allows Sales and Consulting to register new integrations with customer details, ERP selection, baseline validation, and customer committed dates.
- **Deep-Dive Project Detail View (`/project/:id`):**
  - Contractual customer committed Go-Live vs. planned completion date comparison.
  - Delivery milestone progress tracker (Planning → Development → Testing → UAT → Go-Live).
  - Linked Jira issue breakdown with live synchronization status.
  - **Immutable Audit Timeline:** Complete log of all date changes, effort adjustments, and developer reassignments with timestamps.

---

### Screen 4: Developer Workspace (`/workspace`)
*The dedicated operational cockpit for developers to track commitments, customer context, and tasks.*

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 👤 David Kim's Workspace  [Senior ERP Developer · Core Team]     [Switch View: David ▼] │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ CURRENT UTILIZATION      │ AVAILABLE BANDWIDTH      │ ACTIVE COMMITMENTS                │
│       [ 85% Gauge ]      │        6.0 hrs           │           2 Projects              │
│    34h / 40h capacity    │   Healthy buffer         │       Apex Global, Crestview      │
├──────────────────────────┴──────────────────────────┴───────────────────────────────────┤
│ 🏢 My Customers & Delivery Commitments (PRD §12)                                        │
│  [Apex Global: SAP S/4 | Go-Live: 2026-10-15]   [Crestview: Workday | Go-Live: 11-05]   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 📋 My Current Jira Tasks (Synced Bidirectionally)                                       │
│ Jira Key │ Task Summary            │ Status      │ Est / Rem │ Due Date   │ Action      │
│ APX-101  │ Idoc Mapping Interface  │ In Progress │ 24h / 12h │ 2026-09-20 │ [Done]      │
│ APX-102  │ Custom BAPI Connector   │ To Do       │ 16h / 16h │ 2026-09-28 │ [Start]     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 📅 My Upcoming 8-Week Capacity: [W1: 85%] [W2: 110% 🔴] [W3: 90%] [W4: 40%] ...       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Capabilities:
- **Dedicated Developer Home Screen:** Designed for developers to see everything they need on one page without navigating complex project management menus.
- **Customer Context & Commitments (PRD §12):** Directly links technical tasks to customer accounts, customer segments (Enterprise vs Mid-Market), and committed Go-Live dates.
- **Bidirectional Jira Task Table:**
  - Displays assigned Jira issues, technical summaries, estimates, and remaining work.
  - **Role-Aware Task Actions:** Developers can click `Start` or `Done`. Status changes update the Control Tower and mirror to Jira in real time.
- **Consulting Read-Only Protection:** When viewed with the `Consulting` role, the workspace automatically locks:
  - Displays a blue informational alert: *"Read-Only Mode (Consulting): You are viewing David Kim’s workspace. Task status transitions and hour logging are editable by ERP Developers only."*
  - Action buttons are replaced with locked `Read-Only` chips.
- **Personal 8-Week Forward Timeline:** Alerts the developer if they have been overallocated in future weeks so they can proactively raise concerns with their manager.

---

### Screen 5: Settings & Integrations (`/settings`)
*Consolidated administrative governance for Jira synchronization and ERP baseline effort catalogs.*

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚙️ Settings & Integrations                                                              │
│ [ Tab 1: Jira Integration & Sync Engine ]   [ Tab 2: ERP Master Data & Baseline Catalog]│
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ [TAB 1: JIRA INTEGRATION]                                                               │
│  • Connection Status: Active (Mock Jira Adapter, ~400ms latency)                        │
│  • System-of-Record Policy (PRD §14):                                                   │
│      - Control Tower Owns: Delivery planning, dates, baseline effort, allocations       │
│      - Jira Owns: Technical issues, sprint tasks, execution status, work logs           │
│  • [Simulate Inbound Webhook]  [Run Bidirectional Sync Now]                             │
│  • Linked Jira Issues Table: Real-time mirror of all active synchronization tokens      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ [TAB 2: ERP MASTER DATA & BASELINES]                                                    │
│  • ERP System Catalog: SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365, etc.       │
│  • Baseline Days (X) and Default Delta (ΔX) configuration                               │
│  • [+ Add ERP System]  |  [✏️ Edit Baseline Effort]                                     │
│  • Audit Trail: Baseline changes trigger automated audit records                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Capabilities:
- **Unified Tabbed Administration:** Merges technical Jira synchronization and business ERP master data into a single, organized settings center.
- **Tab 1 — Jira Bidirectional Sync Engine (PRD §14 & §15):**
  - **Data Entered Once, Reused Everywhere:** Eliminates manual double-entry between project management spreadsheets and Jira backlogs.
  - **System-of-Record Ownership Matrix:** Explicitly declares field boundaries to prevent sync loops (Control Tower owns delivery planning; Jira owns task execution).
  - **Interactive Webhook Simulator:** Enables administrators to simulate external Jira events (e.g., developer marks issue Done or logs hours) and observe real-time recalculations in the Control Tower.
- **Tab 2 — ERP Master Data Catalog (PRD §26):**
  - Central repository of standard ERP platforms and their default integration baselines ($X$) and standard non-standard deltas ($\Delta X$).
  - Modal dialogs for adding new ERP platforms or editing existing effort models.

---

## 5. End-to-End Operational Workflows

### Workflow 1: Quoting & Scheduling a New Customer Integration
1. **Sales / Consulting** receives a customer request for an ERP integration (e.g., Workday integration for Acme Corp).
2. The user checks the **Executive Command Center** and **Team Heat Map** to observe future team capacity.
3. In **Project Portfolio**, the user clicks **Create ERP Project**, selects the customer, ERP system, and requested Go-Live date.
4. The system automatically populates the standard baseline effort ($X = 15$ days) and prompts for any non-standard scope ($\Delta X$).
5. The project is created; if the required date falls in an over-subscribed week, the project immediately shows an AMBER or RED risk badge, alerting management before the contract is finalized.

### Workflow 2: Resolving a Capacity Deficit
1. The **ERP Manager** opens the **Command Center** and observes an overallocation alert for Week 3.
2. The manager switches the Supply vs. Demand card to **Matrix Table** to identify which developers are over 100%.
3. In the embedded **What-If Simulator**, the manager selects the overallocated developer and tests transferring 20% of their allocation to an available teammate.
4. The simulator confirms that the new allocation eliminates the overtime without causing a deficit elsewhere.
5. The manager clicks **Apply Allocation to Project**; team capacity and project assignments update instantly.

### Workflow 3: Daily Developer Execution & Jira Mirroring
1. The **ERP Developer** opens the **Developer Workspace**.
2. The developer reviews their active customer commitments and current Jira tasks.
3. The developer clicks **Start** on an assigned task (`APX-101`), changing its status to `In Progress`.
4. When finished, the developer clicks **Done**; the remaining hours drop to zero.
5. The status change is mirrored to Jira via the bidirectional sync engine, updating project-level completion metrics simultaneously.

### Workflow 4: Consulting Reviewing Delivery Feasibility
1. A **Consulting Lead** prepares for a customer steerco meeting.
2. The consultant views the **Project Portfolio** to review the customer's project status.
3. Seeing an AMBER badge, the consultant navigates to **Developer Workspace** to review the assigned developer's current workload.
4. The workspace renders in **Read-Only Mode**, giving the consultant full visibility into remaining hours and tasks while preserving developer data integrity.

---

## 6. Core Business Rules & Methodologies

1. **Deterministic Delivery RAG Calculation (PRD §17):**
   - **RED (Critical Risk):** Planned completion date exceeds the contractual customer Go-Live commitment, OR a required developer allocation is completely missing.
   - **AMBER (Elevated Risk):** Assigned developer is currently overallocated (>100%), OR customer commitment date has less than 5 days buffer from planned completion.
   - **GREEN (On Track):** All planned work is staffed within normal capacity limits, and planned completion comfortably precedes customer commitment.

2. **Formulaic Effort Modeling (PRD §4):**
   $$\text{Total ERP Integration Effort} = X \text{ (Standard Baseline)} + \Delta X \text{ (Non-Standard Delta)}$$
   - Ensures non-standard technical debt and custom logic are explicitly accounted for during sales and planning phases.

3. **Capacity Baseline Standards:**
   - 1 Full-Time Developer = 40 hours/week = 5 working days/week.
   - Standard 8-developer team = 320 hours/week = 40 working days/week.
   - Utilization above 100% flags automated capacity warnings and risk triggers.

4. **Strict System-of-Record Boundaries (PRD §14):**
   - To eliminate synchronization conflicts, Control Tower fields (dates, commitments, baseline allocations) can never be overridden by Jira; task execution states (status, time logs) are mastered in Jira and mirrored to the Control Tower.
