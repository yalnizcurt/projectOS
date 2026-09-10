# Oracle NetSuite Troubleshooting & SuiteTalk Error Guide

**Document ID:** DOC-ORA-TRBL-002  
**Source URL:** https://mock-company.com/oracle/troubleshooting  
**Referenced By:** DOC-ORA-001 (Oracle NetSuite Integration Playbook v3.0)  
**Version:** 2.1  
**ERP System:** Oracle NetSuite  
**Effective Date:** 2026-02-05  

---

## 1. Common NetSuite REST API Exceptions

### Error `SSS_REQUEST_LIMIT_EXCEEDED`
* **Cause:** Account-level concurrent governance quota exceeded.
* **Resolution:** Implement exponential backoff retry with jitter (initial delay 500ms, max delay 8000ms, 4 retries max).

### Error `USER_ERROR: Invalid login credentials`
* **Cause:** Token-Based Authentication timestamp drift (>5 minutes) or invalid nonce calculation.
* **Resolution:** Synchronize system clock with NTP server `pool.ntp.org` and verify timestamp is formatted as Unix epoch in seconds.
