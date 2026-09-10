/**
 * Project Service
 * Handles project calculations, effort breakdown, and traceability graph.
 * Ref: PRD Section 8, 16, 20
 */

export class ProjectService {
  /**
   * Calculates total planned effort: Base + Delta = Total
   */
  static calculateEffort(baseEffortDays, additionalEffortDays = 0) {
    const base = Number(baseEffortDays) || 0;
    const delta = Number(additionalEffortDays) || 0;
    return {
      baseEffortDays: base,
      additionalEffortDays: delta,
      totalEffortDays: base + delta,
      hasNonStandardDelta: delta > 0,
    };
  }

  /**
   * Resolves complete traceability chain from Customer down to Tasks and Developers
   * PRD Section 16: Customer -> ERP Project -> Jira Tasks -> Developer -> Capacity
   */
  static buildTraceabilityTree(project, customer, erp, tasks, developers) {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const assignedDevs = developers.filter((d) => project.assignedDeveloperIds?.includes(d.id));

    return {
      customer: {
        id: customer?.id,
        name: customer?.name,
        segment: customer?.segment,
      },
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        rag: project.rag,
        ragDrivers: project.ragDrivers || [],
        plannedStart: project.plannedStartDate,
        plannedEnd: project.plannedCompletionDate,
        commitmentDate: project.customerCommittedDate,
        baseEffortDays: project.baseEffortDays,
        additionalEffortDays: project.additionalEffortDays,
        totalEffortDays: project.totalEffortDays,
      },
      erp: {
        id: erp?.id,
        name: erp?.name,
        category: erp?.category,
        classification: erp?.classification,
      },
      assignedDevelopers: assignedDevs.map((dev) => ({
        id: dev.id,
        name: dev.name,
        role: dev.role,
        skills: dev.skills,
        tasks: projectTasks.filter((t) => t.developerId === dev.id),
      })),
      tasks: projectTasks,
      metrics: {
        totalTasks: projectTasks.length,
        doneTasks: projectTasks.filter((t) => t.status === 'Done').length,
        totalEstimatedHours: projectTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0),
        totalRemainingHours: projectTasks.reduce((acc, t) => acc + (t.remainingHours || 0), 0),
      },
    };
  }
}
