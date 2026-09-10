import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Alert,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useApp } from '../data/store';
import { UserRole } from '../data/schema';
import { CapacityService } from '../services/CapacityService';
import RAGBadge from '../components/common/RAGBadge';
import CapacityGauge from '../components/common/CapacityGauge';
import BrainChatPanel from '../components/brain/BrainChatPanel';
import ContextBar from '../components/brain/ContextBar';

export default function DeveloperWorkspace() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Brain Modal State (§16)
  const [isBrainOpen, setIsBrainOpen] = useState(false);
  const [brainContext, setBrainContext] = useState({
    erp: 'SAP S/4HANA',
    customer: null,
    project: null,
    jiraTask: null,
  });

  // Role permissions: Editable by Dev only (and Admin/Manager). Not editable by Consultant.
  const isDeveloper = state.activeRole === UserRole.DEVELOPER;
  const isConsulting = state.activeRole === UserRole.CONSULTING;
  const canEditTasks = isDeveloper || state.activeRole === UserRole.ADMIN || state.activeRole === UserRole.MANAGER;

  const developer = state.developers.find((d) => d.id === state.activeDeveloperId) || state.developers[0];

  // Developer capacity profile
  const profile = CapacityService.getDeveloperCapacityProfile(
    developer.id,
    state.developers,
    state.allocations,
    state.projects,
    8
  );

  // My Tasks
  const myTasks = state.tasks.filter((t) => t.developerId === developer.id);

  // My Projects & Customers (PRD Section 12 "My Customers")
  const assignedProjects = state.projects.filter((p) => p.assignedDeveloperIds?.includes(developer.id));

  const handleTaskStatusChange = (task, newStatus) => {
    if (!canEditTasks) return;
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: {
          status: newStatus,
          remainingHours: newStatus === 'Done' ? 0 : task.remainingHours,
        },
      },
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Workspace Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              border: '2px solid #bfdbfe',
            }}
          >
            {developer.avatar}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {developer.name}’s Workspace
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {developer.role} · {developer.team} · Skills: {developer.skills.join(', ')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Ask ERP Developer Brain Button (§16) */}
          <Button
            variant="contained"
            startIcon={<PsychologyIcon />}
            onClick={() => {
              const primaryProj = assignedProjects[0];
              const primaryErp = primaryProj ? state.erps.find((e) => e.id === primaryProj.erpId) : state.erps[0];
              setBrainContext({
                erp: primaryErp?.name || 'SAP S/4HANA',
                customer: primaryProj ? state.customers.find((c) => c.id === primaryProj.customerId) : null,
                project: primaryProj || null,
                jiraTask: null,
              });
              setIsBrainOpen(true);
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' },
            }}
          >
            Ask ERP Developer Brain
          </Button>

          {/* Developer Switcher for testing */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Switch Developer View</InputLabel>
            <Select
              value={developer.id}
              label="Switch Developer View"
              onChange={(e) => dispatch({ type: 'SET_ACTIVE_DEVELOPER', payload: e.target.value })}
            >
              {state.developers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name} ({d.skills.slice(0, 2).join(', ')})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Read-Only Notice for Consulting / non-devs */}
      {!canEditTasks && (
        <Alert severity="info" icon={<LockIcon fontSize="inherit" />} sx={{ borderRadius: 2 }}>
          <strong>Read-Only Mode ({state.activeRole}):</strong> You are viewing {developer.name}’s workspace. Task status transitions and hour logging are editable by ERP Developers only.
        </Alert>
      )}

      {/* Over-allocation Alert if applicable */}
      {profile.weeklyBreakdown.some((w) => w.isOverallocated) && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <strong>Capacity Notice:</strong> You are currently overallocated (&gt;100%) in{' '}
          {profile.weeklyBreakdown
            .filter((w) => w.isOverallocated)
            .map((w) => `${w.weekLabel} (${w.utilizationPct}%)`)
            .join(', ')}
          . Speak with your ERP Manager to rebalance project allocations.
        </Alert>
      )}

      {/* Capacity & Bandwidth Summary (PRD Section 12 "My Capacity") */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              CURRENT WEEK UTILIZATION
            </Typography>
            <Box sx={{ mt: 1.5, mb: 1 }}>
              <CapacityGauge utilizationPct={profile.currentUtilizationPct} />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Allocated: <strong>{profile.currentAllocatedHours}h</strong> / 40h capacity
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              AVAILABLE BANDWIDTH
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: profile.currentAvailableHours > 0 ? '#10b981' : '#ef4444',
                my: 0.5,
              }}
            >
              {profile.currentAvailableHours} <Typography component="span" variant="body1">hrs</Typography>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {profile.currentAvailableHours > 0
                ? 'Healthy available capacity for ad-hoc consulting support'
                : 'Zero available bandwidth this week'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              ACTIVE COMMITMENTS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#2563eb', my: 0.5 }}>
              {assignedProjects.length} <Typography component="span" variant="body1">projects</Typography>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Supporting {new Set(assignedProjects.map((p) => p.customerId)).size} customer accounts
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Section 12: My Customers & Assigned Projects */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          My Customers & Delivery Commitments (PRD §12)
        </Typography>
        <Grid container spacing={2}>
          {assignedProjects.map((proj) => {
            const customer = state.customers.find((c) => c.id === proj.customerId);
            const erp = state.erps.find((e) => e.id === proj.erpId);

            return (
              <Grid item xs={12} md={4} key={proj.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
                  }}
                  onClick={() => navigate(`/project/${proj.id}`)}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={erp?.name} size="small" color="primary" sx={{ fontSize: '0.7rem' }} />
                      <RAGBadge status={proj.rag} size="small" />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {proj.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                      Customer: <strong>{customer?.name}</strong> ({customer?.segment})
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Customer Go-Live:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                        {proj.customerCommittedDate}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1, pt: 0.8, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        startIcon={<PsychologyIcon sx={{ fontSize: '15px !important' }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setBrainContext({
                            erp: erp?.name || 'SAP S/4HANA',
                            customer,
                            project: proj,
                            jiraTask: null,
                          });
                          setIsBrainOpen(true);
                        }}
                        sx={{ fontSize: '0.72rem', textTransform: 'none', py: 0.2 }}
                      >
                        Ask Brain
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Section 12: My Current Tasks (Jira Synced) */}
      <Paper sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              My Current Jira Tasks ({myTasks.length})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Execution tasks synchronized bidirectionally with Jira. Updating status here reflects immediately in Jira.
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 110 }}>Jira Key</TableCell>
                <TableCell>Task Summary</TableCell>
                <TableCell sx={{ width: 160 }}>Project</TableCell>
                <TableCell sx={{ width: 130 }}>Status</TableCell>
                <TableCell sx={{ width: 100 }}>Est. / Rem.</TableCell>
                <TableCell sx={{ width: 110 }}>Due Date</TableCell>
                <TableCell align="right" sx={{ width: 180 }}>Action / Brain</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myTasks.map((task) => {
                const proj = state.projects.find((p) => p.id === task.projectId);

                return (
                  <TableRow key={task.id} hover>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#1d4ed8' }}>
                      {task.jiraIssueKey}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {proj?.name.slice(0, 24)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor:
                            task.status === 'Done'
                              ? '#dcfce7'
                              : task.status === 'In Progress'
                              ? '#dbeafe'
                              : '#f1f5f9',
                          color:
                            task.status === 'Done'
                              ? '#15803d'
                              : task.status === 'In Progress'
                              ? '#1d4ed8'
                              : '#475569',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                      {task.estimatedHours}h / <strong>{task.remainingHours}h</strong>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                      {task.dueDate}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.8 }}>
                        {/* Task Brain Action (§16) */}
                        <Tooltip title={`Ask ERP Developer Brain about ${task.jiraIssueKey}`}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const erp = state.erps.find((e) => e.id === proj?.erpId);
                              const customer = state.customers.find((c) => c.id === proj?.customerId);
                              setBrainContext({
                                erp: erp?.name || 'SAP S/4HANA',
                                customer,
                                project: proj,
                                jiraTask: task,
                              });
                              setIsBrainOpen(true);
                            }}
                            sx={{
                              color: '#2563eb',
                              bgcolor: '#eff6ff',
                              borderRadius: 1.5,
                              p: 0.5,
                              '&:hover': { bgcolor: '#dbeafe' },
                            }}
                          >
                            <PsychologyIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        {task.status !== 'Done' ? (
                          canEditTasks ? (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {task.status === 'To Do' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleTaskStatusChange(task, 'In Progress')}
                                  sx={{ fontSize: '0.7rem', py: 0.2 }}
                                >
                                  Start
                                </Button>
                              )}
                              <Button
                                size="small"
                                color="success"
                                variant="contained"
                                onClick={() => handleTaskStatusChange(task, 'Done')}
                                sx={{ fontSize: '0.7rem', py: 0.2 }}
                              >
                                Done
                              </Button>
                            </Box>
                          ) : (
                            <Tooltip title="Task actions are editable by ERP Developers only">
                              <Chip
                                icon={<LockIcon sx={{ fontSize: '12px !important' }} />}
                                label="Read-Only"
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 22, color: 'text.secondary', borderColor: '#cbd5e1' }}
                              />
                            </Tooltip>
                          )
                        ) : (
                          <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                            ✓ Done
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 8-Week Forward Availability Timeline */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          My Upcoming 8-Week Capacity & Bandwidth (PRD §12)
        </Typography>
        <Grid container spacing={1.5}>
          {profile.weeklyBreakdown.map((w) => (
            <Grid item xs={6} sm={3} md={1.5} key={w.weekIndex}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: w.isOverallocated ? '#fca5a5' : w.utilizationPct > 75 ? '#fde68a' : '#bbf7d0',
                  bgcolor: w.isOverallocated ? '#fef2f2' : w.utilizationPct > 75 ? '#fffbeb' : '#f0fdf4',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {w.weekLabel}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5, fontFamily: 'JetBrains Mono, monospace' }}>
                  {w.utilizationPct}%
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', color: 'text.secondary' }}>
                  {w.availableHours > 0 ? `${w.availableHours}h free` : `${w.allocatedHours}h busy`}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ERP Developer Brain Modal Dialog (§16) */}
      <Dialog
        open={isBrainOpen}
        onClose={() => setIsBrainOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1, maxHeight: '90vh' },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon sx={{ color: '#2563eb', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              ERP Developer Brain
            </Typography>
          </Box>
          <IconButton onClick={() => setIsBrainOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ContextBar context={brainContext} onContextChange={setBrainContext} />
          <BrainChatPanel context={brainContext} isCompact={true} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
