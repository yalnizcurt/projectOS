# SAP S/4HANA Technical Configuration Guide

**Document ID:** DOC-SAP-CONF-002  
**Source URL:** https://mock-company.com/sap/configuration  
**Referenced By:** DOC-SAP-001 (SAP S/4HANA Enterprise Integration Playbook v4.2)  
**Version:** 3.1  
**ERP System:** SAP S/4HANA  
**Effective Date:** 2026-02-01  

---

## 1. Gateway & Connectivity Configuration

### 1.1 SSL/TLS Cryptography Settings
All SAP Gateway inbound connections must use TLS 1.3 with SHA-256 ciphers. In SAP Transaction `STRUST`, import the corporate root CA into the `SSL Server Standard` PSE.

### 1.2 Service User Authorization Setup
Configure authorization profile `Z_BAPI_INTEGRATION_BASE` with the following activity groups:
- `S_RFC`: `RFC_NAME = ['RFC_PING', 'BAPI_PO_CREATE1', 'IDOC_INBOUND_ASYNCHRONOUS']`, `ACTVT = 16` (Execute).
- `S_IDOC_ADM`: `ACTVT = 03` (Display), `01` (Create).
- `S_TABU_DIS`: Table authorization group `&NC&` restricted to display mode.

---

## 4. Configuration Requirements for IDoc & ALE

### 4.2 Authentication & RFC Destination Setup
Before IDoc processing can commence:
1. **RFC Destination (SM59):** Create TCP/IP destination `SAP_CONTROL_TOWER_ALE` with Connection Type `T` and Registered Server Program ID `SAP_CT_ALE_LISTENER`.
2. **Gateway Host:** Set to primary application server instance `app01.erp.internal` on Gateway Port `sapgw00` (3300).
3. **Queue Processing (SMQS):** Register destination in scheduler with maximum concurrency of 8 dialog processes.
4. **Partner Profile (WE20):** 
   - Partner Type: `LS` (Logical System).
   - Inbound Parameters: Message Type `ORDERS05`, Process Code `ORDE`.
   - Packet processing: Set to "Pass Immediately" for priority orders or "Collect IDocs" for high-volume batches (>500/hr).

---

## 5. Mandatory Parameters Summary Table

| Parameter Name | Required Value | Location / Transaction | Description |
|---|---|---|---|
| `login/min_password_lng` | 14 | `RZ11` | Minimum service user password length |
| `icm/server_port_0` | `PROT=HTTPS,PORT=443` | Instance Profile | HTTPS Gateway listener |
| `rfc/sign_and_encrypt` | `1` (Active) | Profile parameter | Enforces SNC encryption on all RFC traffic |
| `idoc/serialization` | `ENABLED` | `BD87` | Strictly prevents out-of-order posting |
