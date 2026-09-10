import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  mockCustomers,
  mockERPs,
  mockDevelopers,
  mockProjects,
  mockTasks,
  mockAllocations,
  mockAuditEntries,
} from './mockData';
import { UserRole } from './schema';
import { globalKnowledgeStore } from '../knowledge/KnowledgeStore';
import { seedKnowledgeCorpus } from '../knowledge/SeedKnowledge';

const AppContext = createContext();

const initialState = {
  customers: mockCustomers,
  erps: mockERPs,
  developers: mockDevelopers,
  projects: mockProjects,
  tasks: mockTasks,
  allocations: mockAllocations,
  auditLogs: mockAuditEntries,
  activeRole: UserRole.MANAGER,
  activeDeveloperId: 'dev-1', // Rahul Sharma
  themeMode: 'light',
  notifications: [
    {
      id: 'notif-1',
      title: 'Critical Delivery Risk Alert',
      message: 'Apex Auto Parts (Dynamics 365) is RED: Completion date Nov 10 exceeds Go-Live date Oct 30 by 11 days.',
      type: 'error',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Developer Over-Allocation Detected',
      message: 'David Kim is allocated at 115% for Week 2 and 110% for Week 3.',
      type: 'warning',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Jira Bidirectional Sync Completed',
      message: 'Successfully synchronized 40 tasks with Jira engine. 1 status update received.',
      type: 'info',
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      read: true,
    },
  ],
  jiraSyncStatus: {
    lastSyncTime: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Healthy',
    syncCount: 40,
    isSyncing: false,
    conflicts: [],
  },
  // Part 2: ERP Developer Brain Knowledge State
  knowledgeDocuments: globalKnowledgeStore.listDocuments(),
  knowledgeChunksCount: globalKnowledgeStore.chunks.length,
  brainConversations: [],
  brainFeedback: [],
  knowledgeSyncStatus: {
    lastIndexed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isIndexing: false,
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, activeRole: action.payload };

    case 'SET_ACTIVE_DEVELOPER':
      return { ...state, activeDeveloperId: action.payload };

    case 'TOGGLE_THEME':
      return { ...state, themeMode: state.themeMode === 'light' ? 'dark' : 'light' };

    case 'CREATE_PROJECT': {
      const newProj = action.payload;
      const updatedProjects = [newProj, ...state.projects];
      const audit = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: state.activeRole,
        entityType: 'Project',
        entityId: newProj.id,
        field: 'CREATE',
        oldValue: '-',
        newValue: newProj.name,
        reason: 'New ERP Project registered in Control Tower',
      };
      return {
        ...state,
        projects: updatedProjects,
        auditLogs: [audit, ...state.auditLogs],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'New Project Created',
            message: `Project "${newProj.name}" created with total effort ${newProj.totalEffortDays} days.`,
            type: 'info',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'UPDATE_PROJECT': {
      const { id, updates } = action.payload;
      const existing = state.projects.find((p) => p.id === id);
      if (!existing) return state;

      const updatedProj = { ...existing, ...updates };

      // Generate audit entry
      const auditEntries = Object.keys(updates).map((key) => ({
        id: `audit-${Date.now()}-${key}`,
        timestamp: new Date().toISOString(),
        actor: state.activeRole,
        entityType: 'Project',
        entityId: id,
        field: key,
        oldValue: String(existing[key] ?? '-'),
        newValue: String(updates[key] ?? '-'),
        reason: 'Manual adjustment in Control Tower',
      }));

      return {
        ...state,
        projects: state.projects.map((p) => (p.id === id ? updatedProj : p)),
        auditLogs: [...auditEntries, ...state.auditLogs],
      };
    }

    case 'UPDATE_TASK': {
      const { id, updates } = action.payload;
      const existing = state.tasks.find((t) => t.id === id);
      if (!existing) return state;

      const updatedTask = { ...existing, ...updates };
      const updatedTasks = state.tasks.map((t) => (t.id === id ? updatedTask : t));

      // Audit log
      const audit = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: state.activeRole,
        entityType: 'Task',
        entityId: existing.jiraIssueKey || id,
        field: 'Status/Remaining',
        oldValue: `${existing.status} (${existing.remainingHours}h)`,
        newValue: `${updatedTask.status} (${updatedTask.remainingHours}h)`,
        reason: 'Task updated',
      };

      return {
        ...state,
        tasks: updatedTasks,
        auditLogs: [audit, ...state.auditLogs],
      };
    }

    case 'CREATE_TASK': {
      const newTask = action.payload;
      return {
        ...state,
        tasks: [newTask, ...state.tasks],
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: state.activeRole,
            entityType: 'Task',
            entityId: newTask.jiraIssueKey,
            field: 'CREATE',
            oldValue: '-',
            newValue: newTask.title,
            reason: 'Task created in Control Tower and synced to Jira',
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'ADD_ALLOCATION': {
      const newAlloc = action.payload;
      return {
        ...state,
        allocations: [...state.allocations, newAlloc],
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: state.activeRole,
            entityType: 'Allocation',
            entityId: newAlloc.id,
            field: 'ALLOCATION_ADD',
            oldValue: '0%',
            newValue: `${newAlloc.allocationPct}% (Week ${newAlloc.weekIndex})`,
            reason: 'Developer assigned to project',
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'REALLOCATE_DEVELOPER': {
      const { sourceDeveloperId, targetDeveloperId, projectId, weekIndex, allocationPct, hours } = action.payload;

      // Remove or reduce source allocation
      const filteredAllocations = state.allocations.filter(
        (a) => !(a.developerId === sourceDeveloperId && a.projectId === projectId && a.weekIndex === weekIndex)
      );

      // Add new target allocation
      const newAlloc = {
        id: `alloc-${Date.now()}`,
        developerId: targetDeveloperId,
        projectId,
        weekIndex,
        allocationPct,
        hours,
      };

      const sourceDev = state.developers.find((d) => d.id === sourceDeveloperId);
      const targetDev = state.developers.find((d) => d.id === targetDeveloperId);

      return {
        ...state,
        allocations: [...filteredAllocations, newAlloc],
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: state.activeRole,
            entityType: 'Resource Reallocation',
            entityId: projectId,
            field: 'REALLOCATION',
            oldValue: `${sourceDev?.name || sourceDeveloperId} (${allocationPct}%)`,
            newValue: `${targetDev?.name || targetDeveloperId} (${allocationPct}%)`,
            reason: 'Capacity balancing reallocation by ERP Manager',
          },
          ...state.auditLogs,
        ],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Resource Reallocation Applied',
            message: `Reallocated ${allocationPct}% for Week ${weekIndex} from ${sourceDev?.name} to ${targetDev?.name}.`,
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'START_JIRA_SYNC':
      return {
        ...state,
        jiraSyncStatus: { ...state.jiraSyncStatus, isSyncing: true },
      };

    case 'COMPLETE_JIRA_SYNC':
      return {
        ...state,
        jiraSyncStatus: {
          lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: 'Healthy',
          syncCount: state.tasks.length,
          isSyncing: false,
          conflicts: [],
        },
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Jira Sync Complete',
            message: `Synchronized ${state.tasks.length} tasks across ${state.projects.length} ERP projects.`,
            type: 'info',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      };

    case 'SIMULATE_JIRA_TASK_UPDATE': {
      const { jiraIssueKey, newStatus, remainingHours } = action.payload;
      const targetTask = state.tasks.find((t) => t.jiraIssueKey === jiraIssueKey);
      if (!targetTask) return state;

      const updatedTask = {
        ...targetTask,
        status: newStatus || targetTask.status,
        remainingHours: remainingHours !== undefined ? remainingHours : (newStatus === 'Done' ? 0 : targetTask.remainingHours),
      };

      return {
        ...state,
        tasks: state.tasks.map((t) => (t.jiraIssueKey === jiraIssueKey ? updatedTask : t)),
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: 'Jira Webhook (Simulation)',
            entityType: 'Task',
            entityId: jiraIssueKey,
            field: 'status',
            oldValue: targetTask.status,
            newValue: updatedTask.status,
            reason: 'Bidirectional Jira synchronization incoming event',
          },
          ...state.auditLogs,
        ],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: `Jira Synced: ${jiraIssueKey}`,
            message: `Task ${jiraIssueKey} transitioned from "${targetTask.status}" to "${updatedTask.status}".`,
            type: 'info',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'CREATE_ERP': {
      const newErp = action.payload;
      return {
        ...state,
        erps: [...state.erps, newErp],
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: state.activeRole,
            entityType: 'ERP Master Data',
            entityId: newErp.id,
            field: 'CREATE_ERP',
            oldValue: '-',
            newValue: newErp.name,
            reason: 'Added new ERP system profile and baseline effort',
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'UPDATE_ERP': {
      const { id, updates } = action.payload;
      const existing = state.erps.find((e) => e.id === id);
      return {
        ...state,
        erps: state.erps.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: state.activeRole,
            entityType: 'ERP Master Data',
            entityId: id,
            field: 'UPDATE_EFFORT_RULES',
            oldValue: `Base: ${existing?.baseEffortDays}d, Delta: ${existing?.defaultDeltaDays}d`,
            newValue: `Base: ${updates.baseEffortDays ?? existing?.baseEffortDays}d, Delta: ${updates.defaultDeltaDays ?? existing?.defaultDeltaDays}d`,
            reason: 'Updated baseline integration effort rules',
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'SET_KNOWLEDGE_DOCUMENTS':
      return {
        ...state,
        knowledgeDocuments: action.payload.documents,
        knowledgeChunksCount: action.payload.chunksCount ?? state.knowledgeChunksCount,
        knowledgeSyncStatus: {
          lastIndexed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          isIndexing: false,
        },
      };

    case 'ADD_BRAIN_MESSAGE':
      return {
        ...state,
        brainConversations: [...state.brainConversations, action.payload],
      };

    case 'CLEAR_BRAIN_CONVERSATION':
      return {
        ...state,
        brainConversations: [],
      };

    case 'ADD_BRAIN_FEEDBACK':
      return {
        ...state,
        brainFeedback: [action.payload, ...state.brainFeedback],
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'RESET_TO_MOCK':
      return initialState;

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Seed synthetic playbooks on initial startup if not already seeded
    seedKnowledgeCorpus(false).then(() => {
      dispatch({
        type: 'SET_KNOWLEDGE_DOCUMENTS',
        payload: {
          documents: globalKnowledgeStore.listDocuments(),
          chunksCount: globalKnowledgeStore.chunks.length,
        },
      });
    });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
