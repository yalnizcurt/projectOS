# ERP Delivery & Capacity Control Tower

## Product Requirement Statement

### 1. Product Overview

The ERP Delivery & Capacity Control Tower is an internal project and resource management platform designed to improve the reliability of customer delivery commitments across Sales, Consulting, ERP Management, and ERP Development teams.

The product addresses a recurring operational problem:

Sales and Consulting teams commit customer Go-Live dates before the ERP Integration team has complete visibility into the required integration effort, non-standard development effort, existing project commitments, developer availability, and upcoming team capacity.

As a result, projects may enter the ERP Integration pipeline with dates that are not realistically achievable. The ERP Integration team then becomes a downstream bottleneck, resulting in delayed integrations, delayed Consulting activities, escalations, reallocation of developers, and increased pressure on the development team.

The product will provide a single operational view of:

* Customer projects and delivery commitments
* ERP integration requirements and estimated effort
* Standard versus non-standard ERP work
* Developer assignments and workload
* Current and future developer bandwidth
* Project and task progress
* Customer delivery risk
* Jira execution data
* Team-wide capacity and utilization

The system will integrate bidirectionally with Jira so that users do not need to maintain the same task information in multiple systems.

The objective is not to replace Jira. Jira remains the task execution and work-management system, while this platform acts as the **ERP delivery planning, capacity, allocation, visibility, and commitment management layer**.

---

# 2. Product Vision

The product should enable the organization to answer, at any point in the delivery lifecycle:

> **What are we committed to deliver, what work is required to deliver it, who is doing that work, do we have enough capacity, and which customer commitments are at risk?**

The product should move the organization from reactive resource management to proactive delivery planning.

Instead of discovering capacity problems after a project has started, managers should be able to identify future capacity constraints before they impact customer commitments.

Instead of asking developers manually for workload information, managers should have a live view of assigned customers, active work, upcoming tasks, and available bandwidth.

Instead of asking Sales or Consulting to manually validate ERP team availability, the system should expose delivery feasibility using the available project and capacity data.

---

# 3. Problem Statement

The current process has several gaps.

### 3.1 Customer commitments are disconnected from ERP capacity

Sales and Consulting may know the desired customer Go-Live date, but the ERP Integration team may not know about the commitment early enough or may not have the capacity required to support it.

### 3.2 ERP effort varies by ERP type

Different ERP systems require different levels of integration effort.

A standard ERP integration may have a known baseline effort.

Some non-standard ERP scenarios require additional internal development effort, represented as an additional effort delta.

For example:

Standard integration effort = X days

Non-standard development effort = ΔX days

Total ERP effort = X + ΔX

The platform must be able to represent this difference explicitly.

### 3.3 Team capacity is difficult to understand

Managers need visibility into:

* Which developers are currently occupied
* Which developers have available bandwidth
* Which developers are overallocated
* Which developers will become available in future weeks
* Which projects are consuming capacity
* Which upcoming projects may exceed available capacity

### 3.4 Project status and execution status are fragmented

Project-level planning and Jira task-level execution are separate.

The organization should not require users to manually update both systems with the same information.

### 3.5 Developers lack a consolidated view of their work

Developers should be able to understand:

* Which customers they are currently supporting
* Which ERP integrations they are working on
* Which Jira tasks belong to those projects
* What work remains
* Their current utilization
* Their available bandwidth
* Their upcoming assignments

### 3.6 Managers lack an intuitive capacity visualization

A numerical capacity table alone is insufficient.

Managers need a visual representation of developer availability over time, including periods of low utilization, healthy utilization, and over-allocation.

---

# 4. Product Goals

## Primary Goals

The product must:

1. Provide a single source of operational visibility for ERP delivery planning.
2. Provide managers with current and future developer capacity visibility.
3. Provide a developer-level availability heat map.
4. Track customer commitments against ERP integration workload.
5. Represent standard and non-standard ERP integration effort.
6. Provide visibility into project, customer, developer, and task relationships.
7. Integrate bidirectionally with Jira.
8. Follow a "data entered once" principle wherever practical.
9. Allow developers to see their assigned customers, projects, tasks, and bandwidth.
10. Help managers identify upcoming capacity shortages before they become delivery problems.
11. Provide project-level risk/status indicators based on structured delivery and capacity information.
12. Maintain clear ownership of data between the Control Tower and Jira.

## Secondary Goals

The product should also support:

* Resource allocation decisions
* Reallocation of developers between projects
* Delivery forecasting
* Upcoming workload planning
* Portfolio-level project monitoring
* Historical analysis of team capacity and project execution
* Operational reporting for ERP leadership

---

# 5. Non-Goals

The product is not intended to:

1. Replace Jira as the detailed task execution platform.
2. Replace Jira's native issue-management capabilities.
3. Become a general-purpose enterprise project-management platform.
4. Act as the source of truth for all organizational work outside ERP delivery.
5. Provide AI-generated technical instructions to ERP developers as part of the capacity-management system.
6. Replace the ERP Developer RAG/knowledge system.

The ERP Developer RAG system is a separate product capability whose purpose is to help developers retrieve factual information from ERP playbooks and other approved technical knowledge sources.

The two systems may be connected contextually, but the RAG system is **not part of the core project/capacity calculation engine**.

---

# 6. Primary Users

## 6.1 Sales

Sales users need visibility into whether a proposed customer delivery commitment is operationally realistic.

Primary questions:

* What ERP does the customer use?
* Is the ERP standard or non-standard?
* What ERP integration effort is expected?
* When could the ERP Integration team realistically support the work?
* Are there known capacity constraints?
* Is the requested delivery date feasible?

Sales does not require detailed developer task information unless necessary to understand a delivery risk.

---

## 6.2 Consulting

Consulting users need to understand whether ERP Integration activities will complete in time for downstream implementation activities.

Primary questions:

* What is the customer's ERP?
* What is the planned integration period?
* When is ERP Integration expected to complete?
* Is the integration on schedule?
* Which dependencies are blocking progress?
* Is the customer Go-Live at risk?

---

## 6.3 ERP Manager

The ERP Manager is the primary capacity-management user.

The manager needs to understand:

* Overall team capacity
* Current utilization
* Future utilization
* Developer availability
* Developer allocation
* Project workload
* Upcoming capacity shortages
* Overallocated developers
* Customer commitments at risk
* Opportunities to reallocate resources

The manager should have portfolio-level and developer-level visibility.

---

## 6.4 ERP Developer

Developers need a personal workspace showing their assigned work and capacity.

Primary questions:

* Which customers am I working on?
* Which ERP is involved?
* Which project is each task associated with?
* What Jira tasks am I currently working on?
* What work is coming next?
* How much capacity do I have?
* Am I overallocated?
* What commitments are my current tasks supporting?

---

# 7. Core Product Concepts

The platform should model the relationship between:

**Customer → Project → ERP → Integration Work → Tasks → Developer → Capacity → Commitment**

A project may contain:

* Customer information
* ERP information
* Integration type
* Standard effort
* Additional/non-standard effort
* Planned start date
* Planned completion date
* Customer commitment date
* Dependencies
* Assigned developers
* Jira issues
* Project status
* Delivery risk

The system must preserve this relationship so that work can be traced from an individual Jira task back to the customer and customer commitment it supports.

---

# 8. Project & Commitment Management

The product must support creation and management of ERP integration projects.

A project should be associated with at least:

* Customer
* ERP
* ERP integration type
* Required delivery / Go-Live date
* ERP integration start date
* Estimated integration effort
* Additional development effort where applicable
* Assigned resources
* Dependencies
* Project status
* Jira project / issue relationships

The platform should distinguish between:

### Standard ERP Work

Work that follows an established integration process with a known baseline effort.

### Non-Standard ERP Work

Work that requires additional internal development or specialized effort beyond the standard integration process.

The system must allow the total expected effort to be represented as:

**Base ERP Integration Effort + Additional Development Effort = Total Planned Effort**

The additional effort must remain visible rather than being hidden inside a generic project estimate.

---

# 9. Capacity Management

Capacity management is a core product capability.

The system must represent developer capacity over time.

Capacity should be viewable at:

* Daily level where appropriate
* Weekly level
* Monthly level

The default management view should prioritize weekly capacity because ERP projects are typically planned across multiple working days.

Capacity should account for configurable non-working periods such as:

* Weekends
* Holidays
* Planned leave
* Other known non-working periods

The system should distinguish between:

### Available Capacity

Capacity that has not been allocated to planned work.

### Allocated Capacity

Capacity assigned to active or upcoming projects.

### Consumed Capacity

Work that has already been performed or logged.

### Remaining Capacity

Capacity still available after accounting for current allocations and relevant work.

### Overallocated Capacity

Work assigned beyond the developer's available capacity.

---

# 10. Developer Availability Heat Map

The Developer Availability Heat Map is a core manager feature.

The manager should be able to visually inspect developer availability across a selected date range.

The heat map should display:

**Developer × Time Period**

Each cell should represent the developer's planned utilization or available bandwidth during that period.

The visualization should make it immediately obvious which developers are:

* Highly available
* Normally utilized
* Near capacity
* Overallocated

The exact visual thresholds should be configurable.

For example:

* Green = healthy available capacity
* Amber = limited available capacity / approaching full utilization
* Red = overallocated or capacity deficit

The heat map must support filtering by:

* Team
* Developer
* Date range
* Project
* Customer where appropriate

A manager should be able to select an individual developer from the heat map and drill down into the underlying allocation.

Example drill-down:

**Developer: Rahul**

* Weekly capacity: 40 hours
* Allocated: 32 hours
* Available: 8 hours
* Utilization: 80%

Current allocations:

* Customer A — 16 hours
* Customer B — 12 hours
* Customer C — 4 hours

Upcoming allocation:

* Customer D — 20 hours next week

The heat map should therefore provide both **visual summary and actionable drill-down**.

---

# 11. Team Capacity View

The ERP Manager should have a team-level capacity dashboard.

It should provide:

* Total team capacity
* Total allocated work
* Total available capacity
* Total utilization
* Number of overallocated developers
* Number of available developers
* Capacity by week
* Upcoming capacity shortages
* Capacity by project

The manager should be able to identify future bottlenecks before projects begin.

For example:

| Week   | Team Capacity | Planned Demand | Available / Gap |
| ------ | ------------: | -------------: | --------------: |
| Week 1 |      100 days |        82 days |             +18 |
| Week 2 |      100 days |        96 days |              +4 |
| Week 3 |      100 days |       118 days |             -18 |
| Week 4 |      100 days |       127 days |             -27 |

The exact presentation is subject to UX design, but the underlying product requirement is that **future supply versus demand must be visible**.

---

# 12. Developer Workspace

Every developer should have a personalized workspace.

The workspace should provide:

### My Customers

A list of customers for whom the developer has active or upcoming work.

Each customer should show:

* Customer name
* ERP
* Project
* Commitment date
* Developer allocation
* Project status

### My Current Tasks

The system should show current Jira-linked work, including:

* Task
* Jira ID
* Customer
* Project
* Status
* Priority where applicable
* Estimate
* Remaining work where available

### My Capacity

The developer should be able to see:

* Current utilization
* Available capacity
* Allocated capacity
* Future availability
* Upcoming assignments

The intent is to provide the developer with transparency rather than only giving this information to managers.

---

# 13. Jira Integration

Jira integration is a mandatory core capability.

The integration must support **bidirectional synchronization**.

The business principle is:

> **Data should be entered once and reused everywhere.**

Users should not need to manually maintain the same task information in the Control Tower and Jira.

---

# 14. Jira Data Ownership

The product must define a source of truth for individual data elements.

The Control Tower should generally own delivery-planning concepts such as:

* Customer
* ERP
* Customer commitment date
* Planned integration window
* Capacity
* Developer allocation
* Delivery forecast
* Portfolio-level risk
* ERP project metadata

Jira should generally own execution-level information such as:

* Jira issue
* Task description
* Issue status
* Assignee
* Work log
* Jira-specific issue metadata
* Task execution details

The exact field ownership and synchronization policy must be explicitly defined before implementation.

The system must prevent synchronization loops and conflicting updates.

---

# 15. Bidirectional Jira Synchronization Requirements

When a task is created or linked in the Control Tower, the corresponding Jira representation should be created or associated where appropriate.

When relevant task information changes in Jira, the Control Tower should reflect those changes.

Examples include:

* Task status change
* Assignee change
* Work logged
* Estimate change
* Task completion
* Relevant issue metadata changes

The system should also support appropriate reverse synchronization from the Control Tower to Jira for data owned by the Control Tower.

Synchronization should be observable and auditable.

Users should be able to identify:

* Last successful synchronization
* Synchronization status
* Failed synchronization
* Conflicting data
* Unlinked Jira issues

---

# 16. Project-to-Jira Relationship

Every ERP project should be capable of being connected to the relevant Jira project, epic, story, or task hierarchy.

The system should allow the organization to trace:

**Customer**

→ **ERP Project**

→ **Jira Epic / Story**

→ **Jira Task**

→ **Developer**

→ **Capacity**

This traceability is essential because the manager needs to understand not only how much capacity is being consumed, but also **which customer and commitment are consuming it**.

---

# 17. Delivery Risk / RAG

The platform should provide a structured project-level delivery risk indicator.

This RAG mechanism is **not generative AI and not RAG retrieval**.

It is a deterministic or rule-based operational status that communicates delivery health.

Potential states include:

### Green

The project is currently feasible against available capacity and planned timing.

### Amber

The project is feasible but has a meaningful constraint, dependency, limited capacity buffer, or emerging risk.

### Red

The planned delivery cannot currently be supported by available capacity, schedule, allocation, or known constraints.

The RAG should be explainable.

A manager should not merely see:

**Red**

They should be able to understand the drivers, such as:

* Insufficient developer capacity
* Developer over-allocation
* Remaining work exceeds available time
* Start date delayed
* Dependency unresolved
* Additional development effort
* Upcoming capacity shortage

The precise risk calculation logic is a later planning/technical-design exercise.

---

# 18. Commitment Visibility

The system must connect ERP work to customer commitments.

Managers and relevant users should be able to see:

* Customer commitment date
* Planned ERP integration completion
* Current forecast
* Required remaining effort
* Available capacity
* Assigned developers
* Delivery risk

The objective is to make customer commitments visible from an ERP delivery perspective.

---

# 19. Manager Portfolio View

The manager should have a consolidated portfolio view of all ERP integration projects.

Each project should expose a concise summary such as:

* Customer
* ERP
* Project status
* Assigned developer(s)
* Planned integration effort
* Remaining effort
* Planned completion
* Customer Go-Live
* Delivery risk
* Jira synchronization status

The manager should be able to filter and sort this portfolio.

Useful filtering dimensions include:

* Customer
* ERP
* Developer
* Project status
* RAG
* Commitment date
* Time period
* Standard vs non-standard integration

---

# 20. Resource Allocation

Managers must be able to assign developers to projects and specify planned allocation.

Allocation should support time-based planning.

For example:

Developer A:

* Customer X: 50% for Week 1
* Customer Y: 25% for Week 1
* Internal work: 25% for Week 1

The system should calculate the resulting utilization and remaining bandwidth.

The manager should be able to see the effect of an allocation decision before or immediately after applying it.

---

# 21. Reallocation Visibility

The system should make resource constraints easy to understand.

When a developer is overallocated, the manager should be able to identify:

* Which projects are responsible
* How much capacity is missing
* Which customer commitments are affected
* Which other developers have available capacity

This should allow the manager to make informed resource-reallocation decisions.

The product should not automatically reassign developers without an explicit business rule and authorization model.

---

# 22. Capacity Forecasting

The platform should provide forward-looking visibility.

The manager should be able to answer:

> "What will my team's capacity look like over the next several weeks?"

The system should show:

* Existing allocations
* Planned future allocations
* Known projects
* Available capacity
* Expected shortages
* Expected surplus

The purpose is early identification of bottlenecks.

---

# 23. Single Source of Truth Principle

A fundamental product principle is:

> **Do not ask users to enter the same information twice.**

Where information already exists in Jira or the Control Tower, the platform should reuse it through synchronization rather than requiring manual re-entry.

Examples:

A developer should not need to update task status in the Control Tower after updating Jira.

A manager should not need to recreate every Jira task manually merely to see project workload.

A project's customer and ERP identity should not have to be repeatedly entered across screens.

The system should minimize duplicate data entry while maintaining clear ownership of each field.

---

# 24. Auditability

Because the platform influences customer delivery commitments and internal resource decisions, important changes should be auditable.

The system should capture meaningful changes such as:

* Commitment date changes
* Project estimate changes
* Additional effort changes
* Developer allocation changes
* Developer assignment changes
* Project status changes
* Relevant Jira synchronization changes

Where appropriate, the system should retain:

* Previous value
* New value
* Timestamp
* User/system responsible for the change

---

# 25. Notifications and Alerts

The product should support actionable notifications for meaningful operational conditions.

Examples:

* Developer becomes overallocated
* Team capacity falls below required demand
* Project changes from Green to Amber
* Project changes from Amber to Red
* Customer commitment is approaching while work remains incomplete
* Jira synchronization failure
* New project creates a capacity conflict

Notifications should be designed around actions rather than generating excessive noise.

---

# 26. ERP Master Data

The platform should maintain structured ERP information relevant to delivery planning.

At minimum, this may include:

* ERP name
* ERP category
* Standard / non-standard classification
* Standard integration effort
* Default additional effort rules where applicable
* Active/inactive status

The product should support controlled management of these values.

Changes to effort assumptions should be auditable because they directly affect delivery planning.

---

# 27. Role-Based Access

Access should be role-aware.

Sales should primarily see customer commitment and delivery feasibility information relevant to them.

Consulting should primarily see ERP delivery progress and downstream delivery implications.

Managers should have broader visibility into team capacity, projects, allocations, and delivery risk.

Developers should have visibility into their own assigned work, capacity, and relevant customer/project information.

Administrative users may manage system configuration and integration settings.

The exact authorization model can be defined during solution design.

---

# 28. Key User Journeys

## Journey A — New Customer Project

1. Sales/Consulting creates or registers a new ERP project.
2. Customer and ERP are identified.
3. Standard/non-standard integration information is recorded.
4. Planned ERP effort is established.
5. Required delivery date is recorded.
6. The system evaluates known capacity and resource constraints.
7. The project becomes visible to the ERP Manager.
8. Relevant Jira work is linked or created.
9. Assigned developer(s) receive visibility into the work.
10. Project status and delivery health can subsequently be monitored.

---

## Journey B — Manager Allocates Developer

1. Manager opens capacity view.
2. Manager reviews team availability heat map.
3. Manager selects an available developer.
4. Manager views the developer's existing project commitments.
5. Manager assigns capacity to a new project.
6. System recalculates utilization.
7. System updates project capacity visibility.
8. The manager can immediately see whether another project has become constrained.

---

## Journey C — Developer Starts Work

1. Developer opens personal workspace.
2. Developer sees assigned customers.
3. Developer sees current projects.
4. Developer sees linked Jira tasks.
5. Developer works through Jira.
6. Jira task changes synchronize back to the Control Tower.
7. Remaining work and capacity views update as relevant.

---

## Journey D — Capacity Risk Emerges

1. Developer receives or accumulates additional work.
2. Jira/project activity changes remaining workload.
3. Synchronization updates the Control Tower.
4. Capacity calculations change.
5. Developer moves from healthy utilization to overallocated.
6. Affected project risk may change.
7. Manager sees the new risk in the portfolio and heat map.
8. Manager investigates and may reallocate resources.

---

## Journey E — Management Planning

1. Manager opens team capacity heat map.
2. Manager reviews current and future utilization.
3. Manager identifies future overloaded periods.
4. Manager drills into affected developers.
5. Manager identifies projects causing the demand.
6. Manager reviews customer commitments.
7. Manager makes resource or scheduling decisions.

---

# 29. Core Screens / Product Surfaces

The initial product should conceptually contain the following major surfaces:

### 29.1 Manager Dashboard

Provides:

* Team capacity summary
* Overall utilization
* Upcoming capacity shortages
* Active project portfolio
* Project RAG
* Recent delivery risks

### 29.2 Developer Availability Heat Map

Provides:

* Developer × time visualization
* Utilization
* Availability
* Over-allocation
* Drill-down to projects and tasks

### 29.3 Project Portfolio

Provides:

* All ERP projects
* Customer commitments
* ERP types
* Effort
* Resources
* Delivery health

### 29.4 Project Detail

Provides:

* Customer
* ERP
* Planned effort
* Additional effort
* Timeline
* Assigned developers
* Jira tasks
* Remaining work
* Delivery status

### 29.5 Developer Workspace

Provides:

* My customers
* My projects
* My Jira tasks
* Current allocation
* Remaining capacity
* Upcoming assignments

### 29.6 Capacity Planning

Provides:

* Team capacity
* Project demand
* Developer allocations
* Future capacity
* Resource conflicts

### 29.7 Jira Integration / Sync View

Provides:

* Connected Jira projects
* Linked issues
* Synchronization status
* Errors/conflicts
* Last synchronization

---

# 30. Success Metrics

The product should ultimately be evaluated on whether it improves operational delivery reliability.

Potential success measures include:

### Delivery Predictability

Reduction in ERP-related delays against committed delivery dates.

### Capacity Visibility

Percentage of ERP team capacity that is represented and visible in the platform.

### Planning Accuracy

Difference between planned ERP effort/capacity and actual execution.

### Resource Utilization

Improved distribution of work and reduction in prolonged over-allocation.

### Early Risk Identification

Percentage of projects whose delivery risk is identified before the commitment or well before the expected delivery date.

### Duplicate Data Entry

Reduction in manual duplicate task/project updates between Jira and the Control Tower.

### User Adoption

Percentage of ERP managers/developers/consulting stakeholders actively using the platform for delivery planning and visibility.

---

# 31. Product Principles

The following principles should guide product decisions:

### Principle 1 — Jira Is Not Being Replaced

Jira remains the execution system.

The Control Tower provides the layer Jira does not provide: ERP-specific delivery planning, capacity, allocation, commitment visibility, and cross-functional coordination.

### Principle 2 — Enter Data Once

Users should not maintain duplicate copies of the same task or project information.

### Principle 3 — Capacity Must Be Forward-Looking

The system should not only tell a manager whether the team is overloaded today. It must show whether the team will be overloaded in future weeks.

### Principle 4 — Risk Must Be Explainable

A project should not become Red without users being able to understand the underlying reason.

### Principle 5 — Customer Commitments Must Be Connected to Internal Work

Every major customer commitment should be traceable to the ERP effort and resource capacity required to support it.

### Principle 6 — Developer Visibility Matters

Developers are first-class users of the system, not just resources displayed on a manager dashboard.

### Principle 7 — Separate Delivery Intelligence from Technical Knowledge

The capacity/project platform and the ERP Developer RAG system have different responsibilities.

The Control Tower determines:

**What work exists, who is doing it, when it should happen, and whether the organization has the capacity to deliver it.**

The Developer RAG system determines:

**What factual technical information can be retrieved from ERP development playbooks to help a developer perform that work.**

---

# 32. Future Integration with ERP Developer Brain

The ERP Developer RAG system should remain logically separate from the Control Tower.

However, the product may provide contextual access from a project or task.

For example, from a customer project a developer could access the ERP Developer Brain with relevant project context already selected.

This should not result in the RAG system influencing project capacity calculations unless a future product requirement explicitly defines such a relationship.

The initial requirement is simply to enable the developer to move from:

**"What am I working on?"**

to:

**"How do I perform this ERP integration?"**

without losing project context.

---

# 33. MVP Definition

The first meaningful version should focus on the minimum capabilities required to establish a reliable delivery-control loop.

The MVP should demonstrate:

1. ERP project creation and management.
2. Customer commitment tracking.
3. Standard and non-standard ERP effort representation.
4. Developer availability and capacity management.
5. Developer allocation to projects.
6. Manager-level capacity dashboard.
7. Developer availability heat map.
8. Developer personal workspace.
9. Project-level delivery RAG.
10. Jira integration.
11. Bidirectional synchronization for agreed data fields.
12. Project-to-task-to-developer traceability.
13. Basic auditability.
14. Role-based views for Manager, Developer, Consulting, and Sales.

The MVP should not attempt to become a comprehensive enterprise PM platform.

Its central purpose is to prove that the organization can establish a reliable loop:

**Customer Commitment → ERP Work → Capacity → Developer Allocation → Jira Execution → Progress → Delivery Risk**

---

# 34. Desired End State

The desired end state is a system in which the ERP Integration organization can operate from a single, continuously updated delivery picture.

A manager should be able to open the platform and immediately understand:

> **What are we delivering?**

> **Which customer commitments are coming up?**

> **How much work is required?**

> **Who is doing the work?**

> **Who has bandwidth?**

> **Who is overloaded?**

> **Where will capacity become constrained?**

> **Which projects are at risk?**

> **Why are they at risk?**

A developer should be able to open the platform and immediately understand:

> **Which customers am I supporting?**

> **What projects am I assigned to?**

> **What Jira tasks am I working on?**

> **How much work remains?**

> **How much bandwidth do I have?**

Sales and Consulting should be able to understand:

> **Can the ERP Integration team realistically support the delivery timeline?**

And the organization should achieve this without forcing people to maintain separate copies of the same execution data.

---

# 35. One-Sentence Product Definition

**ERP Delivery & Capacity Control Tower is an internal delivery-planning platform that connects customer commitments, ERP integration effort, developer capacity, resource allocation, and Jira execution into a single operational view, enabling teams to identify delivery constraints before they become customer-facing delays.**

# 36. MVP Development Environment & Future Enterprise Integration

## 36.1 MVP Development Context

The initial MVP will be developed and demonstrated on a personal development laptop.

The MVP must therefore operate independently of the organization's production systems.

The MVP must **not require live Jira credentials, live company APIs, or access to the production Katalyt application** in order to demonstrate the core product experience.

The objective of the MVP is to validate:

* Product workflows
* User experience
* Capacity planning
* Developer allocation
* Project tracking
* Customer commitment visibility
* Developer availability heat map
* Jira-style task synchronization behavior
* Delivery RAG
* Role-specific views

The MVP should use realistic mocked data that represents the expected enterprise environment.

---

# 37. Mock Data Architecture

The MVP should use a local/mock data layer rather than hardcoded values directly inside individual UI components.

The mock data layer should represent the primary entities that will eventually come from backend systems.

At minimum, mock entities should include:

### Customers

Example fields:

* Customer ID
* Customer name
* Customer segment
* ERP
* Project association

### ERP Systems

Example fields:

* ERP ID
* ERP name
* Standard/non-standard classification
* Standard integration effort
* Additional development effort

### Projects

Example fields:

* Project ID
* Customer ID
* ERP ID
* Project name
* Planned start
* Planned completion
* Customer Go-Live
* Total estimated effort
* Remaining effort
* Assigned developers
* Status
* RAG

### Developers

Example fields:

* Developer ID
* Name
* Team
* Capacity
* Working days
* Availability
* Current allocation
* Future allocation

### Tasks

Example fields:

* Task ID
* Jira Issue Key
* Project ID
* Customer ID
* Developer ID
* Task name
* Status
* Priority
* Estimated effort
* Remaining effort
* Start date
* Due date

### Allocations

Example fields:

* Developer ID
* Project ID
* Start date
* End date
* Allocation percentage
* Allocated hours/days

### Capacity Calendar

Example fields:

* Developer ID
* Date/week
* Total capacity
* Allocated capacity
* Available capacity
* Utilization

---

# 38. Mock Jira Integration

The MVP must simulate the future Jira relationship.

The goal is not to build a fake Jira application.

Instead, it should simulate the data and synchronization behavior required by the final product.

The MVP should support a conceptual two-way flow:

**Control Tower ↔ Mock Jira**

For example:

### Control Tower creates assignment

Project:

**ABC Corp — SAP Integration**

Developer:

**Rahul**

Task:

**Configure API endpoint**

The mock Jira layer should contain:

**ABC-1024 — Configure API endpoint**

Status:

**To Do**

The UI should then be able to demonstrate changing the Jira-side task:

**To Do → In Progress**

and reflecting that change inside the Control Tower.

Similarly, completing a task in the simulated Jira layer should update the corresponding project/task state in the Control Tower.

The implementation should make this mock integration replaceable with a real Jira integration later.

---

# 39. Future Jira Integration Boundary

The MVP should isolate Jira-specific functionality behind a dedicated integration/service layer.

The UI should not directly depend on the implementation details of Jira APIs.

Conceptually:

```text
Control Tower UI
       |
       v
Application Service Layer
       |
       v
Jira Integration Adapter
       |
       +---- Mock Jira Adapter (MVP)
       |
       +---- Real Jira Adapter (Production)
```

During MVP development:

**JiraIntegration = MockJiraIntegration**

During enterprise deployment:

**JiraIntegration = CompanyJiraIntegration**

This allows the product to be developed and tested without exposing company credentials or production systems.

---

# 40. Jira Token Requirement

A Jira authentication token is already available for the future enterprise implementation.

The MVP must not require that token.

The token and associated authentication configuration should be introduced only when the application is connected to the organization's Jira environment.

Authentication secrets must never be hardcoded into the frontend application or committed to source control.

Production integration should use secure environment/configuration mechanisms.

---

# 41. Katalyt Integration

The eventual enterprise deployment must integrate the new ERP Delivery Control Tower with **Katalyt**.

Katalyt is treated as an existing company application rather than something that should be recreated as part of this project.

The uploaded Katalyt application source demonstrates an existing React-based application using Material UI components, React Router, authenticated API requests, and a backend endpoint structure. The application currently uses an API base path and exposes multiple domain-specific endpoints, including clients, consulting sessions, knowledge bases, documents, and task execution.

The Control Tower should therefore be designed as an application that can eventually connect to Katalyt through an explicit integration boundary.

---

# 42. Katalyt Integration Objective

The goal of the future Katalyt integration is:

> **Make the new ERP Delivery Control Tower part of the existing Katalyt ecosystem without duplicating data that Katalyt already owns.**

The exact system-of-record mapping must be determined during enterprise implementation.

Potentially reusable Katalyt information may include:

* Users
* Clients/customers
* Existing project/client relationships
* Existing authenticated user identity
* Existing organizational context
* Relevant workflow/task information

The Control Tower should only maintain new data that is genuinely required for ERP delivery management.

---

# 43. Enterprise Integration Model

The intended future architecture should conceptually support:

```text
                       KATALYT
                          |
                 ┌────────┴────────┐
                 │ Existing Data   │
                 │ Authentication  │
                 │ Client Context  │
                 └────────┬────────┘
                          |
                          v
              ┌──────────────────────┐
              │ ERP DELIVERY CONTROL │
              │       TOWER          │
              └──────────┬───────────┘
                         |
                ┌────────┴────────┐
                |                 |
                v                 v
              JIRA          ERP Delivery Data
```

The Control Tower should remain independently structured enough to support the MVP, while allowing its enterprise deployment to consume appropriate Katalyt context and services.

---

# 44. Data Ownership Between Katalyt, Control Tower and Jira

Before production implementation, each entity and field must have a defined system of record.

A preliminary model is:

| Information                  | Likely Owner                                    |
| ---------------------------- | ----------------------------------------------- |
| User identity/authentication | Katalyt/company identity                        |
| Customer/client identity     | Katalyt or agreed master system                 |
| ERP delivery project         | Control Tower                                   |
| ERP delivery commitment      | Control Tower                                   |
| ERP effort assumptions       | Control Tower                                   |
| Developer capacity           | Control Tower                                   |
| Developer allocations        | Control Tower                                   |
| Delivery forecast            | Control Tower                                   |
| Jira tasks                   | Jira                                            |
| Jira task status             | Jira                                            |
| Work logs                    | Jira                                            |
| ERP technical playbooks      | ERP Developer Brain / approved knowledge source |

This mapping is a product requirement for future design, not a final architectural decision.

---

# 45. MVP Data Must Mimic the Future Data Model

Even though the MVP uses mock data, the mock schema should resemble the expected production schema wherever practical.

For example:

```text
customer
    id
    name

erp
    id
    name
    type
    base_effort

project
    id
    customer_id
    erp_id
    committed_date
    planned_start
    planned_end
    status

developer
    id
    name
    capacity

allocation
    developer_id
    project_id
    start_date
    end_date
    allocation

task
    id
    jira_issue_key
    project_id
    developer_id
    status
    estimate
    remaining_effort
```

This reduces the amount of redesign required when moving from the personal-laptop MVP to the company's environment.

---

# 46. Configuration-Driven Integrations

The product should be designed so that external integrations are configurable.

For MVP:

```text
DATA_SOURCE = MOCK
JIRA_MODE = MOCK
KATALYT_MODE = DISABLED
```

For enterprise deployment:

```text
DATA_SOURCE = KATALYT / COMPANY_BACKEND
JIRA_MODE = LIVE
KATALYT_MODE = LIVE
```

The exact configuration mechanism is an implementation decision for the engineering phase.

The product requirement is that the UI and core business logic should not need to be rewritten merely because the data source changes from mock to production.

---

# 47. Integration Testing Strategy

The MVP should be capable of being tested entirely with simulated data.

Testing should include:

### Project Creation

Create a project and verify that the project appears in project, manager, and developer views.

### Allocation

Allocate a developer and verify that capacity changes.

### Heat Map

Change an allocation and verify that the developer's heat-map status changes.

### Jira Simulation

Change a task's state in the mock Jira layer and verify that the Control Tower reflects the change.

### Capacity Risk

Increase planned task effort and verify that the project/developer risk changes.

### Reallocation

Move work from one developer to another and verify that both developers' capacity changes correctly.

### Data Synchronization

Modify a field owned by the simulated external system and verify that the Control Tower reflects the update without creating duplicate records.

---

# 48. Migration from MVP to Enterprise

Moving from MVP to enterprise implementation should be treated as a **data-source and integration transition**, not a complete product rebuild.

The target transition is:

```text
PHASE 1 — PERSONAL MVP

UI
 |
Mock Data
 |
Mock Jira


PHASE 2 — INTERNAL PILOT

UI
 |
Application Backend
 |
Real Jira
 |
Controlled Katalyt Integration


PHASE 3 — ENTERPRISE

Katalyt
    ↕
ERP Delivery Control Tower
    ↕
Jira
```

The product architecture should make these stages possible without changing the fundamental user experience.

---

# 49. Important MVP Constraint

No company credentials, production API tokens, customer-sensitive production data, or proprietary production datasets should be required for the laptop MVP.

Mock data should be synthetic.

The MVP should demonstrate realistic scenarios using fictitious customers, developers, projects, ERP systems, tasks, dates, workloads, and Jira issue keys.

The mock environment should nevertheless be sufficiently realistic to demonstrate:

* Capacity bottlenecks
* Over-allocation
* Customer commitment risk
* Standard versus non-standard ERP effort
* Resource reallocation
* Jira synchronization
* Developer workload visibility
* Manager heat-map visibility

---

# 50. Key Architectural Requirement for Opus

When planning the implementation, Opus should treat the following as an explicit architectural constraint:

> **The product must separate the business domain from external integrations.**

The core ERP delivery domain should operate on normalized application data and business rules.

External systems should be adapters/providers around that domain.

In practical terms:

```text
                   CORE PRODUCT
        ┌─────────────────────────────┐
        │ Projects                    │
        │ Customers                   │
        │ ERP                         │
        │ Capacity                    │
        │ Allocation                  │
        │ Delivery Risk               │
        │ Developer Workspace         │
        └──────────────┬──────────────┘
                       │
             Integration Abstraction
                       │
        ┌──────────────┼───────────────┐
        │              │               │
        ▼              ▼               ▼
    Mock Data      Jira Adapter    Katalyt Adapter
      (MVP)          (Future)        (Future)
```

This is the key requirement that will allow the personal-laptop MVP to evolve into a production application inside the company without throwing away the MVP architecture.
