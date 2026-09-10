# Dynamics 365 Configuration & Azure Bus Guide

**Document ID:** DOC-DYN-CONF-002  
**Source URL:** https://mock-company.com/dynamics/configuration  
**Referenced By:** DOC-DYN-001 (Microsoft Dynamics 365 F&O Integration Playbook v2.5)  
**Version:** 1.8  
**ERP System:** Microsoft Dynamics 365 F&O  
**Effective Date:** 2026-02-12  

---

## 1. Azure Service Bus and DMF Queue Settings

### 1.1 Connection String & SAS Policies
DMF Recurring Integrations consume messages from Azure Service Bus Queues. Configure the Shared Access Signature (SAS) policy with `Listen` and `Send` claims.

### 1.2 Data Entity Mapping
* **General Journal Entries:** Entity `GeneralJournalEntity`
* **Sales Order Lines:** Entity `SalesOrderLineV2Entity`
* **Customers V3:** Entity `CustomerV3Entity`

Set execution batch size to 250 records per chunk with `Auto-Split Data Package` flag enabled in Data Management Workspace.
