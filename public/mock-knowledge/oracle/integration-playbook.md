# Oracle NetSuite Integration Playbook v3.0

**Document ID:** DOC-ORA-001  
**Version:** 3.0  
**ERP System:** Oracle NetSuite  
**Effective Date:** 2026-01-20  
**Author:** ERP Cloud Practice Group  
**Classification:** Approved Internal Playbook  

---

## 1. Overview & Architecture

Oracle NetSuite integrations are conducted via SuiteTalk REST Web Services, SuiteScript 2.1 RESTlets, and SOAP Web Services. For high-volume customer instances, OAuth 2.0 (M2M Token-Based Authentication) is mandated by Oracle governance.

For error codes and resolution steps, see the [NetSuite Troubleshooting & SuiteTalk Error Guide](https://mock-company.com/oracle/troubleshooting).

---

## 2. Mandatory Authentication & Configuration

1. **Token-Based Authentication (TBA):** All API calls must include HMAC-SHA256 authorization headers signed with Consumer Key, Consumer Secret, Token ID, and Token Secret.
2. **SuiteScript 2.1 Concurrency Limits:** Maximum 10 concurrent requests per integration record tier in Sandbox and 25 in Production.
3. **Record Transformation:** Purchase orders must be created via the `record.transform` API from existing Sales Orders to preserve tax line linkages.

---

## 3. Supported Endpoints

* `GET /services/rest/record/v1/customer`: Retrieve customer profile and billing terms.
* `POST /services/rest/record/v1/salesOrder`: Create standard sales transaction.
* `POST /app/site/hosting/restlet.nl`: Custom RESTlet execution endpoint.
