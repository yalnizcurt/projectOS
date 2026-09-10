import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GridOnIcon from '@mui/icons-material/GridOn';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import ShieldIcon from '@mui/icons-material/Shield';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useApp } from '../../data/store';
import { UserRole } from '../../data/schema';

const DRAWER_WIDTH = 250;

export default function Sidebar() {
  const { state } = useApp();
  const location = useLocation();

  const isManagerOrAdmin = state.activeRole === UserRole.MANAGER || state.activeRole === UserRole.ADMIN;
  const isDeveloper = state.activeRole === UserRole.DEVELOPER;
  const isSales = state.activeRole === UserRole.SALES;
  const isConsulting = state.activeRole === UserRole.CONSULTING;

  const navItems = [
    {
      label: 'Command Center',
      path: '/',
      icon: <DashboardIcon sx={{ fontSize: 20 }} />,
      visible: isManagerOrAdmin || isConsulting || isSales,
    },
    {
      label: 'Team Heat Map',
      path: '/heatmap',
      icon: <GridOnIcon sx={{ fontSize: 20 }} />,
      badge: '8-Wk',
      visible: isManagerOrAdmin || isConsulting,
    },
    {
      label: 'Project Portfolio',
      path: '/portfolio',
      icon: <FolderSpecialIcon sx={{ fontSize: 20 }} />,
      badge: `${state.projects.length}`,
      visible: true, // All roles have portfolio visibility tailored to them
    },
    {
      label: 'Developer Workspace',
      path: '/workspace',
      icon: <PersonIcon sx={{ fontSize: 20 }} />,
      badge: isDeveloper ? 'Active' : (isConsulting ? 'Read-Only' : undefined),
      visible: isDeveloper || isManagerOrAdmin || isConsulting,
    },
    {
      label: 'ERP Developer Brain',
      path: '/brain',
      icon: <PsychologyIcon sx={{ fontSize: 20 }} />,
      badge: 'AI',
      visible: isDeveloper || isManagerOrAdmin || isConsulting,
    },
    {
      label: 'Settings & Sync',
      path: '/settings',
      icon: <SettingsIcon sx={{ fontSize: 20 }} />,
      badge: state.jiraSyncStatus.status === 'Healthy' ? 'Live' : 'Err',
      visible: isManagerOrAdmin || isConsulting,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#0f172a', // Dark tech slate
          color: '#f8fafc',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          }}
        >
          <ShieldIcon sx={{ color: '#ffffff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.1, fontSize: '0.92rem' }}>
            Control Tower
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>
            ERP DELIVERY & CAPACITY
          </Typography>
        </Box>
      </Box>

      {/* Role Pill Banner */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            p: 1.2,
            borderRadius: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.65rem' }}>
              CURRENT VIEW
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.8rem' }}>
              {state.activeRole}
            </Typography>
          </Box>
          <Chip label="MVP" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#1e293b', color: '#cbd5e1' }} />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2 }}>
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid transparent',
                    color: isActive ? '#60a5fa' : '#94a3b8',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: '#f8fafc',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#60a5fa' : '#94a3b8', minWidth: 32 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.825rem',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>

      {/* System Status Footer */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
            Jira Adapter: Synced
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
          Last sync: {state.jiraSyncStatus.lastSyncTime}
        </Typography>
      </Box>
    </Drawer>
  );
}
