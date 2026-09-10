import { AdapterInterface } from './AdapterInterface';
import {
  mockCustomers,
  mockERPs,
  mockDevelopers,
  mockProjects,
  mockTasks,
  mockAllocations,
} from '../data/mockData';

export class MockDataAdapter extends AdapterInterface {
  constructor() {
    super();
    this.customers = [...mockCustomers];
    this.erps = [...mockERPs];
    this.developers = [...mockDevelopers];
    this.projects = [...mockProjects];
    this.tasks = [...mockTasks];
    this.allocations = [...mockAllocations];
  }

  async getCustomers() {
    return Promise.resolve(this.customers);
  }

  async getERPs() {
    return Promise.resolve(this.erps);
  }

  async getProjects() {
    return Promise.resolve(this.projects);
  }

  async getDevelopers() {
    return Promise.resolve(this.developers);
  }

  async getTasks(projectId = null) {
    if (projectId) {
      return Promise.resolve(this.tasks.filter((t) => t.projectId === projectId));
    }
    return Promise.resolve(this.tasks);
  }

  async getAllocations() {
    return Promise.resolve(this.allocations);
  }

  async createProject(projectData) {
    const newProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
    };
    this.projects.unshift(newProject);
    return Promise.resolve(newProject);
  }

  async updateProject(id, projectData) {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = { ...this.projects[idx], ...projectData };
      return Promise.resolve(this.projects[idx]);
    }
    throw new Error(`Project ${id} not found`);
  }
}

export const mockDataAdapter = new MockDataAdapter();
