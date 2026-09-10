You are extending an **already-built MVP** called:

# ERP Delivery & Capacity Control Tower

The existing application implements **Part 1: ERP Delivery & Capacity Management**.

Your task is to **integrate Part 2: ERP Developer Brain** into the existing application.

## CRITICAL INSTRUCTION

**Do not rebuild Part 1. Do not replace existing functionality. Do not redesign the existing application architecture unnecessarily.**

Treat the current codebase and existing README as the source of truth for Part 1.

Your responsibility is to:

1. Understand the existing application.
2. Preserve all existing functionality.
3. Add the ERP Developer Brain as a new capability.
4. Integrate it naturally into the existing Developer Workspace and Project context.
5. Build the RAG/knowledge pipeline in a modular way so the current mock MVP can later connect to enterprise systems.
6. Keep Part 1's deterministic delivery RAG completely separate from Part 2's Retrieval-Augmented Generation system.

---

# 1. Existing Product

The existing Control Tower provides:

* Executive Command Center
* Team Availability Heat Map
* Project Portfolio
* Project Detail
* Developer Workspace
* Settings & Integrations
* Developer capacity tracking
* 8-week availability
* Resource allocation
* Customer commitments
* ERP effort sizing using X + ΔX
* Deterministic project delivery RAG
* Jira bidirectional mock integration
* Developer-to-customer-to-project-to-task visibility

The existing Developer Workspace already provides:

* Developer identity
* Assigned customers
* ERP projects
* Customer Go-Live commitments
* Current Jira tasks
* Task status
* Estimated/remaining hours
* Current utilization
* Available bandwidth
* 8-week capacity

Do not break or replace these capabilities.

---

# 2. New Capability

Add:

# ERP Developer Brain

The ERP Developer Brain is a technical knowledge assistant for ERP Developers.

Its purpose is:

> Help ERP Developers find factual, source-grounded information from approved ERP playbooks and the technical documentation referenced by those playbooks.

The system must answer technical questions using retrieved evidence rather than relying blindly on the LLM's general knowledge.

Examples:

* What are the prerequisites for this ERP integration?
* What configuration is required?
* What server settings are required?
* What is the deployment sequence?
* How do I troubleshoot this error?
* What validation steps are required?
* Which configuration parameters are mandatory?
* What are the supported integration methods?

---

# 3. IMPORTANT: There Are Two Different RAGs

The existing product contains a deterministic **Delivery RAG**:

```text
Capacity
Allocation
Schedule
Remaining Work
Commitment Date
Dependencies
        ↓
GREEN / AMBER / RED
```

This must remain unchanged.

The new capability contains a separate **Knowledge RAG**:

```text
Developer Question
        ↓
ERP Context
        ↓
Knowledge Retrieval
        ↓
Relevant Playbook / URL Content
        ↓
Evidence
        ↓
LLM
        ↓
Grounded Answer
        ↓
Citations
```

Never use the Knowledge RAG to calculate project delivery status.

Never use the Delivery RAG as technical knowledge.

Treat these as two completely different subsystems.

---

# 4. Most Important Knowledge Requirement

The ERP playbooks have already been scraped.

However:

**The scraped playbooks contain URLs to additional technical documentation.**

The RAG system must therefore NOT treat the scraped playbook as the endpoint of the knowledge pipeline.

Instead:

```text
Scraped Playbook
      ↓
Extract text
      ↓
Extract URLs contained in the playbook
      ↓
Determine relevant URLs
      ↓
Retrieve linked content
      ↓
Index linked content
      ↓
Make linked content retrievable by the ERP Developer Brain
```

This is a core requirement.

---

# 5. URL Expansion

When ingesting a playbook, inspect its content for URLs.

For every discovered URL:

1. Normalize the URL.
2. Identify the domain.
3. Identify whether the URL is public or requires authentication.
4. Determine whether the URL is likely relevant to ERP technical knowledge.
5. Fetch the content where authorized.
6. Extract useful text.
7. Preserve source/provenance metadata.
8. Index the content.

The system must support links to additional documentation such as:

* ERP technical documentation
* API documentation
* Configuration guides
* Deployment guides
* Troubleshooting guides
* Integration documentation
* Internal technical documentation
* Google Docs
* Google Sheets
* Google Drive resources
* Authenticated enterprise documentation portals

---

# 6. Do Not Blindly Crawl the Internet

The system must not recursively crawl every link found on every page.

Implement controlled link expansion.

The crawler must support configurable controls such as:

```text
Maximum crawl depth
Maximum pages per source
Allowed domains
Allowed URL prefixes
Blocked domains
Allowed file types
Authentication requirements
```

Default behavior should be conservative.

For example:

```text
Playbook
  └── Relevant technical URL
       └── Relevant linked technical page
            └── Relevant second-level documentation
```

Do not follow:

* Navigation links
* Login/logout links
* Marketing links
* Social media links
* Tracking URLs
* Irrelevant external domains
* Unrelated resources

---

# 7. Source Provenance

Every piece of indexed knowledge must retain provenance.

For example:

```text
Original Source:
SAP Integration Playbook v4.2

Referenced URL:
https://...

Referenced Document:
SAP Configuration Guide

Section:
4.2 Authentication

Page:
18
```

The system must preserve the relationship:

```text
Playbook
   ↓ referenced
URL
   ↓ contains
Document/Page
   ↓ contains
Section
   ↓ indexed as
Chunk
```

This provenance must survive chunking and retrieval.

---

# 8. Google Authentication Capability

Some referenced URLs may require Google authentication.

The application must therefore be architected to support authenticated retrieval.

You will **not receive the production credentials during MVP development**.

Do not invent credentials.

Do not hardcode credentials.

Do not require production Google access for the MVP.

Instead, implement an authentication/provider abstraction.

Conceptually:

```text
Authenticated Content Provider
          │
          ├── Mock Auth Provider
          │
          └── Google Workspace Provider
```

The production Google credentials/configuration will be added later.

The architecture must allow the production authentication mechanism to be plugged in without rewriting the RAG pipeline.

---

# 9. Google Workspace Support

The system should be designed to eventually support authenticated resources such as:

* Google Docs
* Google Sheets
* Google Drive files
* Google Drive folders
* Google-hosted internal documentation

For MVP development, create mock/sample authenticated resources or local fixtures that simulate this behavior.

Do not require live company Google authentication.

---

# 10. Knowledge Provider Abstraction

Create an abstraction between the RAG engine and the physical knowledge source.

Conceptually:

```text
KnowledgeProvider
      │
      ├── MockKnowledgeProvider
      │
      └── EnterpriseKnowledgeProvider
```

Likewise for external URLs:

```text
ContentFetcher
      │
      ├── PublicWebFetcher
      ├── MockAuthenticatedFetcher
      └── EnterpriseAuthenticatedFetcher
```

The RAG engine should not care where the content came from.

It should receive normalized documents/chunks with metadata.

---

# 11. Knowledge Ingestion Pipeline

Implement the following conceptual pipeline:

```text
Document / Playbook
        ↓
Document Validation
        ↓
Text Extraction
        ↓
Structure Detection
        ↓
URL Extraction
        ↓
URL Classification
        ↓
Authenticated/Public Fetching
        ↓
Linked Content Extraction
        ↓
Controlled Link Expansion
        ↓
Metadata Enrichment
        ↓
Chunking
        ↓
Embedding / Indexing
        ↓
Knowledge Store
```

Make each stage modular.

Do not put all ingestion logic into a single frontend component.

---

# 12. Supported Source Types

The architecture should support a normalized document model regardless of source type.

Potential source types:

```text
PLAYBOOK
PDF
DOCX
MARKDOWN
WEB_PAGE
GOOGLE_DOC
GOOGLE_SHEET
GOOGLE_DRIVE_FILE
TEXT
```

The MVP may implement a smaller subset, but the architecture should not prevent future source types.

---

# 13. Document Metadata

Every document should contain metadata such as:

```text
documentId
documentName
sourceType
sourceUrl
erp
version
parentDocumentId
parentSourceUrl
section
page
effectiveDate
indexedAt
status
accessType
```

Where a document came from a URL inside another document:

```text
parentDocumentId
parentSourceUrl
```

must be retained.

---

# 14. Chunk Metadata

Each chunk must retain:

```text
chunkId
documentId
documentName
erp
sourceType
sourceUrl
section
heading
page
parentDocumentId
parentSourceUrl
version
```

This is required to produce citations and provenance.

---

# 15. ERP-Aware Retrieval

The existing project model already knows which ERP a customer/project uses.

The Developer Brain should leverage that context.

Example:

```text
Customer:
Apex Global

Project:
ERP Integration

ERP:
SAP S/4HANA

Jira Task:
APX-101 — IDoc Mapping
```

When the developer asks:

> What are the required steps?

the retrieval layer should prioritize:

```text
SAP S/4HANA
```

knowledge.

It should not blindly retrieve Oracle or Workday documentation.

---

# 16. Contextual Developer Brain

Integrate the Developer Brain into the existing Developer Workspace.

Do not make it feel disconnected from the developer's work.

The workspace should gain an action such as:

**Ask ERP Developer Brain**

When opened from a project/task, automatically provide context:

```text
ERP:
SAP S/4HANA

Customer:
Apex Global

Project:
SAP Integration

Jira Task:
APX-101
IDoc Mapping Interface
```

The developer can still edit/change the context.

---

# 17. Integration With Project Detail

Add a similar capability to Project Detail.

Example:

```text
Project: Apex Global
ERP: SAP S/4HANA

[Ask ERP Developer Brain]
```

Opening the brain should automatically know the ERP associated with the project.

---

# 18. Standalone Developer Brain

Also provide a standalone entry point.

For example:

```text
Sidebar

Dashboard
Heat Map
Portfolio
Workspace
ERP Developer Brain
Settings
```

Standalone mode allows a developer to ask technical questions unrelated to the currently selected project.

---

# 19. Developer Brain UI

Do not build a generic consumer chatbot.

Build a focused technical knowledge assistant.

Recommended layout:

```text
┌─────────────────────────────────────────────────────┐
│ ERP DEVELOPER BRAIN                                 │
│ SAP S/4HANA · Apex Global                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Ask about your ERP integration...                   │
│                                                     │
│ "What are the prerequisites for IDoc mapping?"      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ ANSWER                                              │
│                                                     │
│ Source-grounded answer...                           │
│                                                     │
│ Sources                                             │
│ SAP Integration Playbook v4.2                       │
│ Section 3.1                                         │
│                                                     │
│ Linked Configuration Guide                          │
│ Section 4.2                                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

# 20. Source-Grounded Answers

Every factual answer should be supported by retrieved evidence.

The response should prioritize:

1. Approved internal documents
2. Approved linked documentation
3. Other explicitly authorized knowledge sources

Do not silently use model memory to fill gaps.

---

# 21. No-Answer Requirement

When sufficient evidence cannot be found, the assistant must say so.

Example:

> ⚠️ No supported answer found.
>
> I couldn't find sufficient information for this question in the approved ERP knowledge sources.

Do not hallucinate technical instructions.

Do not create configuration values.

Do not invent procedures.

---

# 22. Citation Requirement

Citations are mandatory.

The answer should identify:

* Document
* Version
* Section
* Page where available
* URL where applicable

Example:

```text
Source:
SAP Integration Playbook v4.2
Section 3.1

Source:
SAP Configuration Guide
Section 4.2
URL: ...
```

Where technically possible, citations should be clickable.

---

# 23. Evidence Drawer

Allow the developer to inspect the evidence used by the answer.

Example:

```text
Answer
─────────────

...

Evidence
─────────────

1. SAP Integration Playbook v4.2
   Section 3.1
   Relevance: High

2. SAP Configuration Guide
   Section 4.2
   Relevance: High

[View Source]
```

The developer must be able to understand why the answer was generated.

---

# 24. URL Source Display

For web/URL-derived evidence, display:

* Page title
* URL
* Parent playbook
* Retrieved timestamp
* Relevant section

Example:

```text
Linked from:
SAP Integration Playbook v4.2

Source:
SAP Configuration Guide

Retrieved:
2026-09-10

Section:
Authentication
```

---

# 25. Link Traversal Provenance

If:

```text
Playbook A
   ↓
URL B
   ↓
Page C
   ↓
URL D
   ↓
Page E
```

and the answer uses Page E, the source chain should be retained.

The system should know that Page E was ultimately discovered through Playbook A.

This is important for trust and debugging.

---

# 26. URL Refresh / Re-ingestion

Indexed URL content should retain retrieval metadata.

Support re-fetch/re-index functionality.

An administrator should be able to see:

```text
Last fetched
Last indexed
HTTP/content status
Current version/hash where possible
```

The MVP may support manual refresh.

Future production deployments may support scheduled refresh.

---

# 27. Duplicate Detection

The ingestion system should avoid creating duplicate knowledge when:

* The same URL appears in multiple playbooks.
* The same document is referenced multiple times.
* Multiple URLs resolve to the same underlying resource.

Use normalized URLs/content identifiers where practical.

However, preserve all source relationships.

For example:

```text
Document X
Referenced by:
Playbook A
Playbook B
Playbook C
```

should remain traceable to all three sources.

---

# 28. Knowledge Administration UI

Extend the existing Settings/administration area.

The current Settings screen already contains:

* Jira Integration & Sync
* ERP Master Data & Baseline Catalog

Add:

**ERP Knowledge Base**

The tab should show:

* Documents
* Source URLs
* ERP association
* Versions
* Status
* Last fetched
* Last indexed
* Processing errors
* Re-index action
* Refresh URL action
* Authentication status where relevant

---

# 29. Knowledge Ingestion UI

Provide an admin workflow for adding knowledge.

For MVP:

```text
[Upload Playbook]

ERP:
[ SAP S/4HANA ▼ ]

Document:
[ file ]

[Ingest]
```

After ingestion:

```text
Playbook
    ↓
42 text chunks
    ↓
8 URLs discovered
    ↓
5 relevant URLs
    ↓
4 successfully fetched
    ↓
1 requires authentication
```

This status should be visible.

---

# 30. Authenticated URL State

If a discovered URL requires authentication and the MVP does not have credentials:

Do not fail the entire playbook ingestion.

Mark the resource:

```text
Authentication Required
```

Example:

```text
Playbook ingestion complete

URLs:
✅ 5 indexed
⚠️ 2 require authentication
❌ 0 failed
```

This is important because one inaccessible URL must not destroy the rest of the knowledge pipeline.

---

# 31. Mock Authenticated Resources

Because this MVP runs on a personal laptop:

Create mock authenticated resources that simulate:

```text
Google-authenticated document
Google Drive file
Google Docs document
Google Sheets document
```

The purpose is to prove that:

```text
Playbook
 ↓
Authenticated URL
 ↓
Authentication provider
 ↓
Content retrieval
 ↓
Indexing
 ↓
RAG retrieval
```

works architecturally.

Production credentials can be added later.

---

# 32. Security Requirements

Do not hardcode:

* Google credentials
* API keys
* OAuth secrets
* Jira tokens
* Production URLs requiring credentials

Use environment/configuration abstraction.

The MVP should work without production credentials.

The production application should be able to inject credentials through the organization's approved secret/configuration mechanism.

---

# 33. RAG Retrieval Pipeline

Implement the retrieval flow approximately as:

```text
User Question
      ↓
Context Builder
      ↓
Query Processing
      ↓
ERP/Metadata Filters
      ↓
Semantic Retrieval
      ↓
Optional Keyword/Hybrid Retrieval
      ↓
Ranking
      ↓
Top Evidence
      ↓
Prompt Construction
      ↓
LLM
      ↓
Grounded Answer
      ↓
Citations
```

Use a modular design so retrieval strategy can be improved later.

---

# 34. Context Builder

The context builder may include:

```text
Current ERP
Current Customer
Current Project
Current Jira Task
Current developer role
Conversation history
```

Only include information that is actually available.

Do not invent customer-specific technical facts.

---

# 35. Technical Knowledge Versus Customer Data

Customer information from Part 1 is contextual metadata.

It should not automatically become technical knowledge.

For example:

```text
Customer:
Apex Global
```

does not mean:

> Apex Global uses configuration X

unless an approved source explicitly says so.

Maintain a clear boundary between:

**Project context**

and

**documented technical knowledge**.

---

# 36. Conversation Memory

The Developer Brain may maintain conversation context.

Example:

Developer:

> What configuration is required?

Assistant:

> ...

Developer:

> What happens if authentication fails?

The system should understand the preceding conversation.

However, conversation history must never override authoritative documentation.

---

# 37. Feedback

Add:

```text
👍 Helpful
👎 Not Helpful
```

Optional negative categories:

* Incorrect answer
* Wrong source
* Not relevant
* Missing information
* Other

Store this feedback for future evaluation.

---

# 38. RAG Evaluation

Create a small evaluation dataset of representative ERP questions.

Example:

```text
Question:
What are the prerequisites for ERP X integration?

Expected ERP:
ERP X

Expected Source:
ERP X Integration Playbook

Expected Section:
Prerequisites

Expected Facts:
A
B
C
```

Evaluate:

* Retrieval accuracy
* Source relevance
* Groundedness
* Citation correctness
* Hallucination
* No-answer behavior
* ERP relevance

---

# 39. Observability

Record enough information to debug retrieval quality.

At minimum, internally track:

```text
Query
ERP context
Retrieved documents
Retrieved chunks
Relevance scores where available
Generated answer
Citations
User feedback
Timestamp
```

Do not expose sensitive internal implementation details unnecessarily in the UI.

---

# 40. Mock MVP Data

The MVP must run completely on a personal laptop.

Use synthetic data for:

* Customers
* Developers
* Projects
* Jira issues
* ERP systems
* Playbooks
* Linked URLs
* Authenticated documents

The knowledge corpus should be realistic enough to demonstrate:

1. Playbook ingestion.
2. URL extraction.
3. Linked-page retrieval.
4. Authenticated-source handling.
5. Chunking/indexing.
6. ERP-aware retrieval.
7. Source-grounded answers.
8. Citations.
9. No-answer behavior.
10. Provenance.

---

# 41. Example Mock Knowledge Structure

Create something conceptually similar to:

```text
mock-knowledge/
│
├── sap/
│   ├── integration-playbook.md
│   ├── configuration-guide.md
│   ├── troubleshooting-guide.md
│   └── authenticated/
│       ├── deployment-guide.md
│       └── server-config.md
│
├── oracle/
│   ├── integration-playbook.md
│   └── troubleshooting-guide.md
│
└── dynamics/
    ├── integration-playbook.md
    └── configuration-guide.md
```

The playbook should contain links to the other mock documents so the URL-discovery pipeline is actually exercised.

Do not merely preload the final chunks into the vector store and call it done.

The MVP must demonstrate the ingestion path.

---

# 42. Mandatory Demonstration Scenario

The final MVP must demonstrate this scenario end-to-end:

### Step 1

Admin ingests:

**SAP Integration Playbook**

### Step 2

The playbook contains:

```text
https://mock-company.com/sap/configuration
```

and

```text
Google-authenticated documentation reference
```

### Step 3

The ingestion system discovers both links.

### Step 4

The public/mock URL is fetched.

### Step 5

The authenticated resource goes through the authentication abstraction.

### Step 6

All successfully retrieved content is indexed.

### Step 7

Developer opens:

**Apex Global → SAP S/4HANA → APX-101**

### Step 8

Developer asks:

> What configuration is required before starting this integration?

### Step 9

The system retrieves relevant evidence from:

* The original playbook
* The linked configuration documentation
* The authenticated documentation where applicable

### Step 10

The system provides:

* Grounded answer
* Multiple sources
* Section/page references
* Source URLs
* Provenance

---

# 43. Failure Scenarios

Handle gracefully:

### URL unavailable

Show:

```text
Unable to retrieve source.
```

Do not destroy the original playbook.

### Authentication unavailable

Show:

```text
Authentication required.
```

Keep the source pending.

### Unsupported document

Show:

```text
Unsupported source type.
```

### Retrieval finds nothing

Show:

```text
No supported answer found.
```

### LLM failure

Show a useful system error without fabricating an answer.

### Source parsing failure

Mark the source as failed and preserve the ingestion error.

---

# 44. Production Migration

The MVP is local/mock.

The future enterprise implementation should allow:

```text
MVP

Mock Playbooks
Mock URLs
Mock Google Auth
Mock Knowledge Store
Mock Jira
```

to become:

```text
Enterprise

Real Playbooks
Enterprise/Internal URLs
Google Enterprise Authentication
Enterprise Knowledge Store
Real Jira
Katalyt
```

without changing the core Developer Brain experience.

---

# 45. Katalyt Integration Boundary

The company deployment will eventually integrate the Control Tower with **Katalyt**.

Do not implement fake production Katalyt APIs.

Do not invent endpoint contracts.

Instead, preserve an integration boundary so the enterprise application can later provide:

* authenticated user context
* customer/client context
* organizational context
* knowledge/document sources where appropriate

The new ERP Developer Brain should be capable of consuming those enterprise sources through adapters/providers.

---

# 46. Preserve Existing Jira Architecture

The existing application has a mock Jira integration.

Do not replace it.

The Developer Brain can consume Jira context, such as:

```text
Jira Issue Key
Task Summary
ERP
Project
Developer
```

but Jira execution remains governed by the existing Part 1 implementation.

The Developer Brain must not modify Jira merely because the developer asked a question.

---

# 47. Do Not Make the Developer Brain Autonomous

The initial version is an assistant, not an autonomous ERP engineer.

It should not automatically:

* Modify Jira
* Modify capacity
* Reassign developers
* Change project dates
* Change delivery RAG
* Deploy software
* Execute ERP commands
* Change customer systems

unless explicitly added as a future capability.

---

# 48. UX Integration Principle

The developer should not have to leave the workflow to obtain technical knowledge.

The desired experience is:

```text
Customer
  ↓
Project
  ↓
ERP
  ↓
Task
  ↓
"How do I do this?"
  ↓
ERP Developer Brain
  ↓
Evidence-backed answer
```

This reduces context switching while preserving separation between project management and technical knowledge.

---

# 49. Definition of Done

Part 2 is complete when:

### Existing Application

* All current Part 1 screens continue to work.
* Existing capacity calculations remain unchanged.
* Existing developer workspace remains functional.
* Existing Jira mock synchronization remains functional.
* Existing deterministic project RAG remains unchanged.

### ERP Developer Brain

* Developer can open the ERP Developer Brain.
* Developer can ask natural-language technical questions.
* ERP context can be inherited from the current project.
* Conversation context works.
* Relevant documentation is retrieved.
* Playbook URLs are automatically discovered.
* Relevant linked URLs are fetched.
* Authenticated URL handling is implemented through an abstraction.
* Google Workspace-style resources can be simulated in the MVP.
* Linked documents are indexed.
* Source provenance is retained.
* Answers contain citations.
* Evidence can be inspected.
* No-answer behavior works.
* Admin can inspect knowledge sources and ingestion status.
* Documents can be refreshed/re-indexed.
* Retrieval is ERP-aware.
* Duplicate sources are handled.
* Failure scenarios are handled gracefully.

### MVP Constraints

* Runs completely on a personal laptop.
* Does not require production Jira credentials.
* Does not require production Google credentials.
* Does not require production Katalyt.
* Uses synthetic/mock knowledge and project data.
* Production integration points are abstracted cleanly.

---

# 50. Final Architecture Principle

The resulting product should conceptually look like:

```text
                    ERP DELIVERY
                  CONTROL TOWER
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
     Projects        Capacity           Jira
        │
        ▼
 Developer Workspace
        │
        ▼
 ERP Developer Brain
        │
        ▼
 ┌────────────────────────────┐
 │ Knowledge Retrieval Layer  │
 └──────────────┬─────────────┘
                │
      ┌─────────┼──────────┐
      ▼         ▼          ▼
 Playbooks   Linked URLs   Google
                          Sources
      │         │          │
      └─────────┼──────────┘
                ▼
       Evidence / Retrieval
                ▼
              LLM
                ▼
       Grounded Answer
                ▼
        Citations + Sources
```

The key product distinction is:

**Part 1 manages delivery.**

**Part 2 provides technical knowledge.**

Part 2 should be deeply integrated into the developer workflow but should remain a logically independent knowledge subsystem.

Build the MVP so that today's mock data can later be replaced by real enterprise Jira, Google-authenticated documentation, and Katalyt integrations without rewriting the core product.
