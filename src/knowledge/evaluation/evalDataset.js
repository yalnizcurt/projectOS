/**
 * RAG Evaluation Benchmark Dataset
 * Complies with statement2 §38.
 * Test set of representative ERP integration questions, expected sources, and validation rules.
 */

export const evalDataset = [
  {
    id: 'eval-sap-1',
    question: 'What are the prerequisites before starting an SAP S/4HANA integration?',
    erp: 'SAP S/4HANA',
    expectedSource: 'SAP S/4HANA Enterprise Integration Playbook v4.2',
    expectedSection: 'Integration Prerequisites & Baseline Checklist',
    expectedKeywords: ['BAPI_COMM_SVC', 'ORDERS05', 'WE82', '3300', 'S4H-K900142'],
    mustNotContain: ['NetSuite', 'SuiteTalk', 'Dynamics', 'DMF'],
    type: 'STANDARD_RETRIEVAL',
  },
  {
    id: 'eval-sap-2',
    question: 'What configuration is required for IDoc mapping and partner profiles?',
    erp: 'SAP S/4HANA',
    expectedSource: 'SAP S/4HANA Technical Configuration Guide',
    expectedSection: 'Configuration Requirements for IDoc & ALE',
    expectedKeywords: ['SM59', 'SAP_CONTROL_TOWER_ALE', 'WE20', 'ORDERS05', 'ORDE'],
    type: 'LINKED_DOC_RETRIEVAL',
  },
  {
    id: 'eval-sap-3',
    question: 'How do I resolve SAP IDoc Status 51 error?',
    erp: 'SAP S/4HANA',
    expectedSource: 'SAP S/4HANA Integration Troubleshooting & Error Resolution',
    expectedSection: 'Common IDoc Status Codes & Resolution',
    expectedKeywords: ['Status 51', 'WE19', 'MM03', 'E1EDK01'],
    type: 'LINKED_DOC_RETRIEVAL',
  },
  {
    id: 'eval-sap-4',
    question: 'What server settings and buffer allocation are required for production SAP deployment?',
    erp: 'SAP S/4HANA',
    expectedSource: 'SAP Server Configuration & Security Parameters',
    expectedKeywords: ['mTLS', '4096-bit', 'gw/max_conn', 'table_buffer_area'],
    type: 'AUTHENTICATED_DOC_RETRIEVAL',
  },
  {
    id: 'eval-oracle-1',
    question: 'What are the authentication prerequisites for Oracle NetSuite API integration?',
    erp: 'Oracle NetSuite',
    expectedSource: 'Oracle NetSuite Integration Playbook v3.0',
    expectedKeywords: ['Token-Based Authentication', 'HMAC-SHA256', 'SuiteScript'],
    mustNotContain: ['SAP', 'BAPI', 'IDoc', 'S/4HANA'],
    type: 'STANDARD_RETRIEVAL',
  },
  {
    id: 'eval-oracle-2',
    question: 'How do I handle NetSuite SSS_REQUEST_LIMIT_EXCEEDED error?',
    erp: 'Oracle NetSuite',
    expectedSource: 'Oracle NetSuite Troubleshooting & SuiteTalk Error Guide',
    expectedKeywords: ['SSS_REQUEST_LIMIT_EXCEEDED', 'exponential backoff', 'jitter'],
    type: 'LINKED_DOC_RETRIEVAL',
  },
  {
    id: 'eval-dynamics-1',
    question: 'What are the required legal entity parameters for Dynamics 365 OData requests?',
    erp: 'Microsoft Dynamics 365 F&O',
    expectedSource: 'Microsoft Dynamics 365 F&O Integration Playbook v2.5',
    expectedKeywords: ['cross-company=true', 'Azure Entra ID', 'DMF'],
    type: 'STANDARD_RETRIEVAL',
  },
  {
    id: 'eval-no-answer',
    question: 'What is the quantum encryption protocol for connecting alien mainframe XYZ-9999?',
    erp: 'SAP S/4HANA',
    expectedNoAnswer: true,
    type: 'NEGATIVE_NO_ANSWER_CHECK',
  },
];
