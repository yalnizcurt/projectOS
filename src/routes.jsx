import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import ManagerDashboard from './pages/ManagerDashboard';
import HeatMap from './pages/HeatMap';
import ProjectPortfolio from './pages/ProjectPortfolio';
import ProjectDetail from './pages/ProjectDetail';
import DeveloperWorkspace from './pages/DeveloperWorkspace';
import DeveloperBrain from './pages/DeveloperBrain';
import SettingsSync from './pages/SettingsSync';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<ManagerDashboard />} />
        <Route path="/heatmap" element={<HeatMap />} />
        <Route path="/portfolio" element={<ProjectPortfolio />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/workspace" element={<DeveloperWorkspace />} />
        <Route path="/brain" element={<DeveloperBrain />} />
        <Route path="/settings" element={<SettingsSync />} />

        {/* Legacy route redirects to consolidated views */}
        <Route path="/capacity" element={<Navigate to="/" replace />} />
        <Route path="/jira-sync" element={<Navigate to="/settings" replace />} />
        <Route path="/erp-management" element={<Navigate to="/settings" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
