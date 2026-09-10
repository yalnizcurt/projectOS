import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '../data/store';
import { ProjectService } from '../services/ProjectService';
import { DeliveryRiskEngine } from '../services/DeliveryRiskEngine';
import RAGBadge from '../components/common/RAGBadge';
import EffortBreakdown from '../components/common/EffortBreakdown';
import AuditTimeline from '../components/common/AuditTimeline';
import CapacityGauge from '../components/common/CapacityGauge';
import BrainChatPanel from '../components/brain/BrainChatPanel';
import ContextBar from '../components/brain/ContextBar';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  // Brain Modal State (§17)
  const [isBrainOpen, setIsBrainOpen] = useState(false);

  const project = state.projects.find((p) => p.id === id);
  const customer = state.customers.find((c) => c.id === project?.customerId);
  const erp = state.erps.find((e) => e.id === project?.erpId);
  const tasks = state.tasks.filter((t) => t.projectId === project?.id);
  const assignedDevs = state.developers.filter((d) => project?.assignedDeveloperIds?.includes(d.id));
  const projectAuditLogs = state.auditLogs.filter((a) => a.entityId === id || a.entityId === project?.jiraProjectKey);

  // Modals
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    developerId: assignedDevs[0]?.id || state.developers[0]?.id,
    estimatedHours: 24,
    priority: 'Medium',
    status: 'To Do',
  });

  const [isAssignDevOpen, setIsAssignDevOpen] = useState(false);
  const [newDevId, setNewDevId] = useState(state.developers[0]?.id);
  const [newDevAllocPct, setNewDevAllocPct] = useState(50);
  const [newDevWeek, setNewDevWeek] = useState(1);

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Project Not Found
        </Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/portfolio')}>
          Back to Portfolio
        </Button>
      </Box>
    );
  }

  // Evaluate dynamic RAG
  const riskAnalysis = DeliveryRiskEngine.evaluateProjectRisk(
    project,
    state.developers,
    state.allocations,
    state.tasks
  );

  const handleCreateTask = () => {
    if (!newTask.title) return;

    const taskCount = tasks.length + 1;
    const key = `${project.jiraProjectKey}-${100 + taskCount}`;

    const created = {
      id: `task-${Date.now()}`,
      jiraIssueKey: key,
      projectId: project.id,
      customerId: project.customerId,
      developerId: newTask.developerId,
      title: newTask.title,
      status: newTask.status,
      priority: newTask.priority,
      estimatedHours: Number(newTask.estimatedHours),
      remainingHours: Number(newTask.estimatedHours),
      loggedHours: 0,
      dueDate: project.plannedCompletionDate,
    };

    dispatch({ type: 'CREATE_TASK', payload: created });
    setIsAddTaskOpen(false);
  };

  const handleAssignDeveloper = () => {
    if (!newDevId) return;

    // Add developer to project if not already in list
    if (!project.assignedDeveloperIds.includes(newDevId)) {
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          id: project.id,
          updates: {
            assignedDeveloperIds: [...project.assignedDeveloperIds, newDevId],
          },
        },
      });
    }

    // Add allocation
    dispatch({
      type: 'ADD_ALLOCATION',
      payload: {
        id: `alloc-${Date.now()}`,
        developerId: newDevId,
        projectId: project.id,
        weekIndex: Number(newDevWeek),
        allocationPct: Number(newDevAllocPct),
        hours: (Number(newDevAllocPct) / 100) * 40,
      },
    });

    setIsAssignDevOpen(false);
  };

  const handleTaskStatusChange = (task, newStatus) => {
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
      {/* Navigation Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/portfolio')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {project.name}
              </Typography>
              <RAGBadge status={riskAnalysis.rag} drivers={riskAnalysis.ragDrivers} />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              Customer: <strong>{customer?.name}</strong> ({customer?.segment}) · Jira Key: <strong>{project.jiraProjectKey}</strong>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Ask ERP Developer Brain (§17) */}
          <Button
            variant="outlined"
            startIcon={<PsychologyIcon />}
            onClick={() => setIsBrainOpen(true)}
            sx={{
              fontWeight: 700,
              color: '#2563eb',
              borderColor: '#93c5fd',
              bgcolor: '#eff6ff',
              '&:hover': { bgcolor: '#dbeafe', borderColor: '#2563eb' },
            }}
          >
            Ask ERP Developer Brain
          </Button>

          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsAssignDevOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            Assign Developer
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddTaskOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            New Jira Task
          </Button>
        </Box>
      </Box>

      {/* RAG Explainable Drivers Callout (PRD §17) */}
      <Paper
        sx={{
          p: 2.5,
          bgcolor: riskAnalysis.rag === 'RED' ? '#fef2f2' : riskAnalysis.rag === 'AMBER' ? '#fffbeb' : '#f0fdf4',
          border: '1px solid',
          borderColor: riskAnalysis.rag === 'RED' ? '#fecaca' : riskAnalysis.rag === 'AMBER' ? '#fde68a' : '#bbf7d0',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: riskAnalysis.rag === 'RED' ? '#991b1b' : riskAnalysis.rag === 'AMBER' ? '#92400e' : '#166534',
            mb: 0.5,
          }}
        >
          Delivery Health Assessment (Deterministic Risk Drivers)
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {riskAnalysis.ragDrivers.map((driver, idx) => (
            <Typography
              component="li"
              key={idx}
              variant="body2"
              sx={{
                fontSize: '0.825rem',
                color: riskAnalysis.rag === 'RED' ? '#7f1d1d' : riskAnalysis.rag === 'AMBER' ? '#78350f' : '#14532d',
                mb: 0.3,
              }}
            >
              {driver}
            </Typography>
          ))}
        </Box>
      </Paper>

      {/* Main Grid: Effort & Commitment vs Developers */}
      <Grid container spacing={3}>
        {/* Left: Effort & Schedule */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Delivery Scope & Commitment Timeline
            </Typography>

            <Box sx={{ mb: 2.5 }}>
              <EffortBreakdown
                baseEffortDays={project.baseEffortDays}
                additionalEffortDays={project.additionalEffortDays}
                totalEffortDays={project.totalEffortDays}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Planned Start
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {project.plannedStartDate}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Planned Completion
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {project.plannedCompletionDate}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Customer Go-Live
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: project.plannedCompletionDate > project.customerCommittedDate ? '#ef4444' : '#16a34a',
                  }}
                >
                  {project.customerCommittedDate}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                ERP SYSTEM METADATA:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                <strong>{erp?.name}</strong> ({erp?.category}) — {erp?.description}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right: Assigned Developers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Assigned ERP Developers ({assignedDevs.length})
              </Typography>
              <Button size="small" startIcon={<PersonAddIcon />} onClick={() => setIsAssignDevOpen(true)}>
                Add Resource
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {assignedDevs.map((dev) => {
                const devTasks = tasks.filter((t) => t.developerId === dev.id);
                const devAllocs = state.allocations.filter((a) => a.developerId === dev.id && a.projectId === project.id);

                return (
                  <Box
                    key={dev.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {dev.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {dev.role} · {dev.skills.slice(0, 2).join(', ')}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${devTasks.length} tasks assigned`}
                        size="small"
                        sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {devAllocs.map((alloc) => (
                        <Chip
                          key={alloc.id}
                          label={`Week ${alloc.weekIndex}: ${alloc.allocationPct}% (${alloc.hours}h)`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.72rem', fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Jira Tasks Section (PRD §15 & 16) */}
      <Paper sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Jira Execution Tasks ({tasks.length})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              PRD Section 14: Jira owns execution fields (status, remaining work); Control Tower mirrors updates.
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setIsAddTaskOpen(true)}
          >
            Create Jira Task
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 110 }}>Issue Key</TableCell>
                <TableCell>Summary</TableCell>
                <TableCell sx={{ width: 140 }}>Assignee</TableCell>
                <TableCell sx={{ width: 130 }}>Jira Status</TableCell>
                <TableCell sx={{ width: 90 }}>Priority</TableCell>
                <TableCell sx={{ width: 100 }}>Est. / Rem.</TableCell>
                <TableCell align="right" sx={{ width: 140 }}>Quick Transition</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const dev = state.developers.find((d) => d.id === task.developerId);

                return (
                  <TableRow key={task.id} hover>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#1d4ed8' }}>
                      {task.jiraIssueKey}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {dev?.name || 'Unassigned'}
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
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: task.priority === 'Critical' ? '#dc2626' : task.priority === 'High' ? '#ea580c' : '#64748b',
                        }}
                      >
                        {task.priority}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                      {task.estimatedHours}h / <strong>{task.remainingHours}h</strong>
                    </TableCell>
                    <TableCell align="right">
                      {task.status !== 'Done' ? (
                        <Button
                          size="small"
                          color="success"
                          variant="text"
                          onClick={() => handleTaskStatusChange(task, 'Done')}
                          sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          Mark Done
                        </Button>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                          ✓ Completed
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Audit History (PRD §24) */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          Project Audit Log & Change History (PRD §24)
        </Typography>
        <AuditTimeline auditLogs={projectAuditLogs} />
      </Paper>

      {/* Create Task Modal */}
      <Dialog open={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Jira Execution Task</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Task Summary / Title"
              fullWidth
              size="small"
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. Implement Custom BAPI OData Adapter"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Assignee</InputLabel>
              <Select
                value={newTask.developerId}
                label="Assignee"
                onChange={(e) => setNewTask({ ...newTask, developerId: e.target.value })}
              >
                {state.developers.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name} ({d.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Estimated Hours"
                  type="number"
                  fullWidth
                  size="small"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTask.priority}
                    label="Priority"
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsAddTaskOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTask} disabled={!newTask.title}>
            Create Task & Sync to Jira
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Developer Modal */}
      <Dialog open={isAssignDevOpen} onClose={() => setIsAssignDevOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Developer to Project</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Developer</InputLabel>
              <Select
                value={newDevId}
                label="Developer"
                onChange={(e) => setNewDevId(e.target.value)}
              >
                {state.developers.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name} — {d.role} ({d.team})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Target Week</InputLabel>
                  <Select
                    value={newDevWeek}
                    label="Target Week"
                    onChange={(e) => setNewDevWeek(e.target.value)}
                  >
                    {Array.from({ length: 8 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        Week {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Allocation Percentage (%)"
                  type="number"
                  fullWidth
                  size="small"
                  value={newDevAllocPct}
                  onChange={(e) => setNewDevAllocPct(e.target.value)}
                  helperText={`${(newDevAllocPct / 100) * 40} hours per week`}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsAssignDevOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignDeveloper}>
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* ERP Developer Brain Modal Dialog (§17) */}
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
              ERP Developer Brain · {project?.name}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsBrainOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ContextBar
            context={{
              erp: erp?.name || 'SAP S/4HANA',
              customer,
              project,
              jiraTask: null,
            }}
            onContextChange={() => {}}
          />
          <BrainChatPanel
            context={{
              erp: erp?.name || 'SAP S/4HANA',
              customer,
              project,
              jiraTask: null,
            }}
            isCompact={true}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
