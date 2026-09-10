/**
 * Capacity Service
 * Computes weekly developer capacity, team capacity, and heat map metrics.
 * Ref: PRD Section 9, 10, 11, 22
 */

export const HEATMAP_THRESHOLDS = {
  HEALTHY_MAX: 75, // 0 - 75% -> Green
  AMBER_MAX: 95,   // 76 - 95% -> Amber
  // > 95% -> Red (Overallocated / Near capacity)
};

export class CapacityService {
  /**
   * Computes the heat map matrix for all developers across N weeks (default 8 weeks)
   */
  static getHeatMapMatrix(developers, allocations, projects, numWeeks = 8) {
    const weekLabels = Array.from({ length: numWeeks }, (_, i) => `Week ${i + 1}`);

    const matrix = developers.map((dev) => {
      const devAllocations = allocations.filter((a) => a.developerId === dev.id);

      const weeks = Array.from({ length: numWeeks }, (_, i) => {
        const weekIndex = i + 1;
        const weekAllocs = devAllocations.filter((a) => a.weekIndex === weekIndex);

        const totalAllocPct = weekAllocs.reduce((sum, a) => sum + (a.allocationPct || 0), 0);
        const totalAllocHours = weekAllocs.reduce(
          (sum, a) => sum + (a.hours || (a.allocationPct / 100) * dev.weeklyCapacityHours),
          0
        );

        const availableHours = Math.max(0, dev.weeklyCapacityHours - totalAllocHours);
        const overtimeHours = Math.max(0, totalAllocHours - dev.weeklyCapacityHours);

        let status = 'GREEN';
        if (totalAllocPct > 100 || overtimeHours > 0) {
          status = 'RED';
        } else if (totalAllocPct > HEATMAP_THRESHOLDS.HEALTHY_MAX) {
          status = 'AMBER';
        }

        // Detailed drilldown projects
        const projectBreakdown = weekAllocs.map((a) => {
          const proj = projects.find((p) => p.id === a.projectId);
          return {
            projectId: a.projectId,
            projectName: proj?.name || a.projectId,
            allocationPct: a.allocationPct,
            hours: a.hours || (a.allocationPct / 100) * dev.weeklyCapacityHours,
            projectRag: proj?.rag || 'GREEN',
          };
        });

        return {
          weekIndex,
          weekLabel: weekLabels[i],
          utilizationPct: Math.round(totalAllocPct),
          allocatedHours: totalAllocHours,
          availableHours,
          overtimeHours,
          status,
          projectBreakdown,
        };
      });

      const avgUtilization = Math.round(
        weeks.reduce((acc, w) => acc + w.utilizationPct, 0) / numWeeks
      );

      const isCurrentlyOverallocated = weeks.some((w) => w.status === 'RED');

      return {
        developer: dev,
        weeks,
        avgUtilization,
        isCurrentlyOverallocated,
      };
    });

    return {
      weekLabels,
      matrix,
    };
  }

  /**
   * Generates the Team Capacity Supply vs Demand Table
   * Ref: PRD Section 11 Table
   */
  static getTeamSupplyDemandTable(developers, allocations, numWeeks = 8) {
    const totalTeamCapacityHoursPerWeek = developers.reduce(
      (sum, d) => sum + (d.weeklyCapacityHours || 40),
      0
    );
    // Convert to days (8h/day)
    const totalTeamCapacityDays = totalTeamCapacityHoursPerWeek / 8;

    return Array.from({ length: numWeeks }, (_, i) => {
      const weekIndex = i + 1;
      const weekAllocs = allocations.filter((a) => a.weekIndex === weekIndex);

      const plannedDemandHours = weekAllocs.reduce((sum, a) => {
        const dev = developers.find((d) => d.id === a.developerId);
        const weeklyCap = dev?.weeklyCapacityHours || 40;
        return sum + (a.hours || (a.allocationPct / 100) * weeklyCap);
      }, 0);

      const plannedDemandDays = Math.round((plannedDemandHours / 8) * 10) / 10;
      const gapDays = Math.round((totalTeamCapacityDays - plannedDemandDays) * 10) / 10;
      const utilizationPct = Math.round((plannedDemandHours / totalTeamCapacityHoursPerWeek) * 100);

      const overallocatedDevsCount = developers.filter((dev) => {
        const devAllocs = weekAllocs.filter((a) => a.developerId === dev.id);
        const totalPct = devAllocs.reduce((s, a) => s + (a.allocationPct || 0), 0);
        return totalPct > 100;
      }).length;

      return {
        weekIndex,
        weekLabel: `Week ${weekIndex}`,
        teamCapacityDays: totalTeamCapacityDays,
        plannedDemandDays,
        gapDays, // positive = surplus, negative = deficit
        utilizationPct,
        overallocatedDevsCount,
        hasDeficit: gapDays < 0,
      };
    });
  }

  /**
   * Retrieves personal developer capacity overview
   */
  static getDeveloperCapacityProfile(developerId, developers, allocations, projects, numWeeks = 8) {
    const dev = developers.find((d) => d.id === developerId);
    if (!dev) return null;

    const devAllocs = allocations.filter((a) => a.developerId === developerId);

    const weeklyBreakdown = Array.from({ length: numWeeks }, (_, i) => {
      const weekIndex = i + 1;
      const weekAllocs = devAllocs.filter((a) => a.weekIndex === weekIndex);
      const totalPct = weekAllocs.reduce((s, a) => s + (a.allocationPct || 0), 0);
      const allocatedHours = (totalPct / 100) * dev.weeklyCapacityHours;
      const availableHours = Math.max(0, dev.weeklyCapacityHours - allocatedHours);

      const projectsInWeek = weekAllocs.map((a) => {
        const p = projects.find((proj) => proj.id === a.projectId);
        return {
          id: a.projectId,
          name: p?.name,
          allocationPct: a.allocationPct,
          hours: a.hours || (a.allocationPct / 100) * dev.weeklyCapacityHours,
        };
      });

      return {
        weekIndex,
        weekLabel: `Week ${weekIndex}`,
        totalCapacityHours: dev.weeklyCapacityHours,
        allocatedHours,
        availableHours,
        utilizationPct: Math.round(totalPct),
        isOverallocated: totalPct > 100,
        projects: projectsInWeek,
      };
    });

    const currentWeek = weeklyBreakdown[0];

    return {
      developer: dev,
      currentUtilizationPct: currentWeek.utilizationPct,
      currentAllocatedHours: currentWeek.allocatedHours,
      currentAvailableHours: currentWeek.availableHours,
      weeklyBreakdown,
    };
  }
}
