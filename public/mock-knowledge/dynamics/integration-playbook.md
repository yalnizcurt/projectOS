# Microsoft Dynamics 365 F&O Integration Playbook v2.5

**Document ID:** DOC-DYN-001  
**Version:** 2.5  
**ERP System:** Microsoft Dynamics 365 F&O  
**Effective Date:** 2026-01-25  
**Author:** ERP Microsoft Practice CoE  
**Classification:** Approved Internal Playbook  

---

## 1. Architecture Overview

Dynamics 365 Finance & Operations integrations communicate through Microsoft Azure Entra ID (formerly Azure AD) OAuth 2.0 app registrations, OData v4 public endpoints, and Data Management Framework (DMF) Recurring Integrations.

Consult the [Dynamics 365 Configuration & Azure Bus Guide](https://mock-company.com/dynamics/configuration) for queue topology and data entity mappings.

---

## 2. Prerequisites & Identity Configuration

1. **Azure Entra ID App Registration:** Register multi-tenant client application with `Dynamics ERP API` delegated and application permissions (`Ax.FullControl`).
2. **System Administration in D365:** Navigate to `System Administration > Setup > Azure Active Directory Applications` and map Client ID to an active user ID with role `Data Management Operations Administrator`.
3. **Legal Entity Context:** Every OData request must include URL parameter `cross-company=true` or provide HTTP header `Prefer: odata.include-annotations="*"`.

---

## 3. Supported Methods & High-Throughput Ingestion

* **OData v4 CRUD:** Recommended for interactive transactions under 50 records/batch.
* **Recurring Data Integration (DMF API):** Mandatory for bulk journal imports (>10,000 lines) using ZIP package manifests.
