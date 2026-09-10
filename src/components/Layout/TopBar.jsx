import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Badge,
  Button,
  Menu,
  MenuItem as DropdownItem,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SyncIcon from '@mui/icons-material/Sync';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApp } from '../../data/store';
import { UserRole } from '../../data/schema';
import { SyncService } from '../../services/SyncService';
import MockJiraSimulatorModal from '../common/MockJiraSimulatorModal';

export default function TopBar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    dispatch({ type: 'SET_ROLE', payload: newRole });
    if (newRole === UserRole.DEVELOPER) {
      navigate('/workspace');
    }
  };

  const handleDevChange = (e) => {
    dispatch({ type: 'SET_ACTIVE_DEVELOPER', payload: e.target.value });
  };

  const handleSyncNow = async () => {
    await SyncService.executeBidirectionalSync(dispatch, state.tasks);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          {/* Left Title / Context */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.2 }}>
                ERP Delivery Control Tower
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                Operational Visibility & Capacity Allocation Layer
              </Typography>
            </Box>

            {/* Jira Status Pill */}
            <Tooltip title="Click to trigger bidirectional synchronization with mock Jira engine">
              <Chip
                icon={
                  state.jiraSyncStatus.isSyncing ? (
                    <SyncIcon sx={{ animation: 'spin 1s linear infinite', fontSize: 16 }} />
                  ) : (
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981 !important' }} />
                  )
                }
                label={state.jiraSyncStatus.isSyncing ? 'Syncing...' : `Jira Synced (${state.jiraSyncStatus.lastSyncTime})`}
                size="small"
                onClick={handleSyncNow}
                sx={{
                  bgcolor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#dcfce7' },
                }}
              />
            </Tooltip>
          </Box>

          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Interactive Jira Simulator Button */}
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() => setIsSimulatorOpen(true)}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                borderColor: '#bfdbfe',
                bgcolor: '#eff6ff',
                '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
              }}
            >
              Simulate Jira Event
            </Button>

            {/* Developer Selector (if role is Developer or Manager inspecting specific workspace) */}
            {(state.activeRole === UserRole.DEVELOPER || state.activeRole === UserRole.MANAGER) && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ fontSize: '0.8rem' }}>Active Developer</InputLabel>
                <Select
                  value={state.activeDeveloperId}
                  label="Active Developer"
                  onChange={handleDevChange}
                  sx={{ fontSize: '0.8rem', height: 36 }}
                >
                  {state.developers.map((dev) => (
                    <MenuItem key={dev.id} value={dev.id} sx={{ fontSize: '0.8rem' }}>
                      {dev.name} ({dev.team.split(' ')[0]})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Role Switcher (PRD Section 27) */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>Role View</InputLabel>
              <Select
                value={state.activeRole}
                label="Role View"
                onChange={handleRoleChange}
                sx={{ fontSize: '0.8rem', height: 36, fontWeight: 700, color: '#1d4ed8' }}
              >
                <MenuItem value={UserRole.MANAGER}>ERP Manager</MenuItem>
                <MenuItem value={UserRole.DEVELOPER}>ERP Developer</MenuItem>
                <MenuItem value={UserRole.SALES}>Sales</MenuItem>
                <MenuItem value={UserRole.CONSULTING}>Consulting</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              </Select>
            </FormControl>

            {/* Notifications */}
            <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)} size="small">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ color: '#64748b' }} />
              </Badge>
            </IconButton>

            {/* Notifications Dropdown Menu */}
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={() => setNotifAnchorEl(null)}
              PaperProps={{
                sx: { width: 360, maxHeight: 420, p: 1, borderRadius: 2 },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 1.5, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Operational Alerts ({unreadCount})
                </Typography>
                <Button
                  size="small"
                  onClick={() => dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' })}
                  sx={{ fontSize: '0.7rem' }}
                >
                  Clear All
                </Button>
              </Box>
              <Divider sx={{ mb: 1 }} />

              {state.notifications.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No active notifications.
                  </Typography>
                </Box>
              ) : (
                state.notifications.map((notif) => (
                  <DropdownItem
                    key={notif.id}
                    onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', payload: notif.id })}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      whiteSpace: 'normal',
                      p: 1.2,
                      borderRadius: 1.5,
                      mb: 0.5,
                      bgcolor: notif.read ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            notif.type === 'error' ? '#ef4444' : notif.type === 'warning' ? '#f59e0b' : '#3b82f6',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
                        {notif.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'text.secondary', pl: 2 }}>
                      {notif.message}
                    </Typography>
                  </DropdownItem>
                ))
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Interactive Jira Webhook Simulator Modal */}
      <MockJiraSimulatorModal open={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />
    </>
  );
}
