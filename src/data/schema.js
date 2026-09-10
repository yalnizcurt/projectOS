/**
 * Data Schema and Domain Model Constants
 * ERP Delivery & Capacity Control Tower
 */

export const RAGStatus = {
  GREEN: 'GREEN',
  AMBER: 'AMBER',
  RED: 'RED',
};

export const ProjectStatus = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  READY_FOR_TESTING: 'Ready for Testing',
  UAT: 'UAT',
  COMPLETED: 'Completed',
};

export const TaskStatus = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export const TaskPriority = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const UserRole = {
  MANAGER: 'ERP Manager',
  DEVELOPER: 'ERP Developer',
  SALES: 'Sales',
  CONSULTING: 'Consulting',
  ADMIN: 'Admin',
};

export const ERPType = {
  STANDARD: 'Standard',
  NON_STANDARD: 'Non-Standard',
};
