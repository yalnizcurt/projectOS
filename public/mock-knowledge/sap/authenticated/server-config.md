# SAP Server Configuration & Security Parameters [Google Workspace Confidential]

**Document ID:** DOC-SAP-AUTH-004  
**Source URL:** https://docs.google.com/document/d/sap-server-config/edit  
**Access Classification:** Confidential (Google Workspace Enterprise Auth Required)  
**Referenced By:** DOC-SAP-001 (SAP S/4HANA Enterprise Integration Playbook v4.2)  
**Version:** 1.4  
**ERP System:** SAP S/4HANA  
**Effective Date:** 2026-03-01  

---

## 1. Enterprise Security Infrastructure

### 1.1 Mutual TLS (mTLS) Certificate Configuration
All outbound integration endpoints connecting to enterprise SAP landscapes must exchange mutual X.509 client certificates:
* Subject Alternative Name (SAN): `sap-gateway.controltower.corp`
* Cipher suites: `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
* Minimum key length: 4096-bit RSA or 384-bit ECDSA

### 1.2 Dedicated Environment Server Parameters
Before initiating cutover to production:
* **Max Concurrent RFC Connections:** Configure `gw/max_conn = 2000` and `gw/max_overflow = 500` in `/etc/sap/profile.default`.
* **SAP Message Server Port:** Port 3600 (MS HTTP) and 3900 (Internal RFC).
* **Buffer Allocation:** Allocate minimum 24GB shared memory to Table Buffer (`zcsa/table_buffer_area = 25165824`).
