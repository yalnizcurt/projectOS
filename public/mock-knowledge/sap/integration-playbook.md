# SAP S/4HANA Enterprise Integration Playbook v4.2

**Document ID:** DOC-SAP-001  
**Version:** 4.2  
**ERP System:** SAP S/4HANA  
**Effective Date:** 2026-01-15  
**Author:** ERP Enterprise Architecture Center of Excellence  
**Classification:** Approved Internal Playbook  

---

## 1. Overview and Architecture

This playbook defines the standardized integration architecture for connecting enterprise client workflows with SAP S/4HANA on-premise and private cloud editions. The integration layer utilizes SAP BAPI (Business Application Programming Interface), Intermediate Documents (IDocs), and SAP OData services over HTTPS.

Before starting any implementation, developers must ensure all foundational connectivity and technical prerequisites are fulfilled according to the specifications in Section 2.

---

## 2. Integration Prerequisites & Baseline Checklist

Before initiating developer integration work for any SAP S/4HANA customer instance (e.g. Apex Global), the following technical prerequisites are strictly required:

1. **SAP System Connectivity:** Active HTTPS/RFC connection to SAP Gateway with valid SSL certificate handshake.
2. **Technical User Credentials:** A dedicated service user (e.g. `BAPI_COMM_SVC`) with authorization profile `Z_BAPI_INTEGRATION_BASE`.
3. **IDoc Interface Readiness:** Message type `ORDERS05` and `DESADV01` activated in transaction `WE82` and partner profiles created in `WE20`.
4. **Network & Ports:** Port 443 (OData REST/HTTPS) and Port 3300/3301 (SAP Gateway RFC) open through enterprise firewalls.
5. **Transport Requests:** Transport `S4H-K900142` (Custom Field BAPI Extensions) imported into target client system.

For detailed authentication parameters, server timeout rules, and mutual TLS configurations, consult the approved [SAP Technical Configuration Guide](https://mock-company.com/sap/configuration).

---

## 3. IDoc Mapping and Inbound Processing

### 3.1 IDoc Interface Preparation
IDoc mapping requires structured transformation of customer purchase orders and delivery notifications into standard SAP segments:
- **Segment E1EDK01:** Header data mapping including Document Type (`BSART = 'NB'`) and Purchasing Org (`EKORG`).
- **Segment E1EDP01:** Item-level details including Material Number (`MATNR`), Quantity (`MENGE`), and Unit of Measure (`MEINS`).
- **Segment E1EDK14:** Organizational assignments (Company Code `BUKRS`, Division `SPART`).

Refer to Section 3.1 of this playbook for segment validation routines. Additional deep configuration on transport and queue handling can be found in the [SAP Configuration Guide (Section 4.2)](https://mock-company.com/sap/configuration).

### 3.2 Error Handling & Serialization
All incoming IDocs must pass serialization checks via transaction `BD87`. In the event of status `51` (Application document not posted) or status `56` (Syntax error in IDoc), consult the [SAP Integration Troubleshooting Guide](https://mock-company.com/sap/troubleshooting).

---

## 4. Production Deployment & Security Governance

Final go-live and production deployment requires specific server configuration parameters and change management sign-offs. Because these documents contain sensitive internal network topology and security credentials:

* See the Google Workspace-restricted document: [SAP Server Configuration & Security Parameters](https://docs.google.com/document/d/sap-server-config/edit) (requires Google Workspace Authorization).
* Review the production checklist in: [SAP Enterprise Production Deployment Guide](https://docs.google.com/document/d/sap-deployment-guide/edit) (Google Authentication Required).

---

## 5. Supported Integration Methods

* **OData v2 / v4:** Recommended for real-time synchronous queries and UI extensions.
* **BAPI via RFC:** Recommended for synchronous transactional creation (e.g. `BAPI_PO_CREATE1`).
* **IDoc via ALE:** Mandatory for asynchronous bulk master data and purchase order interchange.
