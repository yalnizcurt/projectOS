import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApp } from '../data/store';
import RAGBadge from '../components/common/RAGBadge';
import EffortBreakdown from '../components/common/EffortBreakdown';

export default function ProjectPortfolio() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('ALL');
  const [filterERP, setFilterERP] = useState('ALL');
  const [filterRAG, setFilterRAG] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Modal State for New Project Creation (PRD Journey A)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    customerId: state.customers[0]?.id || '',
    erpId: state.erps[0]?.id || '',
    isNonStandard: false,
    baseEffortDays: state.erps[0]?.baseEffortDays || 25,
    additionalEffortDays: 0,
    customerCommittedDate: '2026-11-30',
    plannedStartDate: '2026-10-15',
    plannedCompletionDate: '2026-11-20',
    assignedDeveloperIds: [state.developers[0]?.id],
    description: '',
  });

  // Filter projects
  const filteredProjects = state.projects.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCustomer !== 'ALL' && p.customerId !== filterCustomer) return false;
    if (filterERP !== 'ALL' && p.erpId !== filterERP) return false;
    if (filterRAG !== 'ALL' && p.rag !== filterRAG) return false;
    if (filterType === 'STANDARD' && p.isNonStandard) return false;
    if (filterType === 'NON_STANDARD' && !p.isNonStandard) return false;
    return true;
  });

  const handleOpenCreate = () => {
    const defaultErp = state.erps[0];
    setNewProject({
      name: '',
      customerId: state.customers[0]?.id || '',
      erpId: defaultErp?.id || '',
      isNonStandard: defaultErp?.classification === 'Non-Standard',
      baseEffortDays: defaultErp?.baseEffortDays || 25,
      additionalEffortDays: defaultErp?.defaultDeltaDays || 0,
      customerCommittedDate: '2026-11-30',
      plannedStartDate: '2026-10-15',
      plannedCompletionDate: '2026-11-20',
      assignedDeveloperIds: [state.developers[0]?.id],
      description: '',
    });
    setIsCreateOpen(true);
  };

  const handleCreateProject = () => {
    if (!newProject.name) return;

    const totalDays = Number(newProject.baseEffortDays) + Number(newProject.additionalEffortDays);
    const key = newProject.name.slice(0, 3).toUpperCase();

    const created = {
      id: `proj-${Date.now()}`,
      name: newProject.name,
      customerId: newProject.customerId,
      erpId: newProject.erpId,
      jiraProjectKey: key,
      status: 'Planning',
      isNonStandard: newProject.isNonStandard,
      baseEffortDays: Number(newProject.baseEffortDays),
      additionalEffortDays: Number(newProject.additionalEffortDays),
      totalEffortDays: totalDays,
      remainingDays: totalDays,
      plannedStartDate: newProject.plannedStartDate,
      plannedCompletionDate: newProject.plannedCompletionDate,
      customerCommittedDate: newProject.customerCommittedDate,
      assignedDeveloperIds: newProject.assignedDeveloperIds,
      rag: 'GREEN',
      ragDrivers: ['Newly planned ERP project with baseline capacity allocation'],
      description: newProject.description || 'ERP Integration pipeline project',
    };

    dispatch({ type: 'CREATE_PROJECT', payload: created });
    setIsCreateOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Title & Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            ERP Project Portfolio
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            PRD Section 19: Portfolio overview linking customer commitments, ERP effort (X + ΔX), and delivery health.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ fontWeight: 700 }}
        >
          Register New Project
        </Button>
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FilterListIcon sx={{ color: 'text.secondary' }} />
        <TextField
          size="small"
          label="Search Project Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 220 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Customer</InputLabel>
          <Select
            value={filterCustomer}
            label="Customer"
            onChange={(e) => setFilterCustomer(e.target.value)}
          >
            <MenuItem value="ALL">All Customers</MenuItem>
            {state.customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>ERP System</InputLabel>
          <Select
            value={filterERP}
            label="ERP System"
            onChange={(e) => setFilterERP(e.target.value)}
          >
            <MenuItem value="ALL">All ERPs</MenuItem>
            {state.erps.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Delivery RAG</InputLabel>
          <Select
            value={filterRAG}
            label="Delivery RAG"
            onChange={(e) => setFilterRAG(e.target.value)}
          >
            <MenuItem value="ALL">All RAG Statuses</MenuItem>
            <MenuItem value="GREEN">Green (On Track)</MenuItem>
            <MenuItem value="AMBER">Amber (At Risk)</MenuItem>
            <MenuItem value="RED">Red (Critical)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Effort Scope</InputLabel>
          <Select
            value={filterType}
            label="Effort Scope"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="ALL">All Types</MenuItem>
            <MenuItem value="STANDARD">Standard Only</MenuItem>
            <MenuItem value="NON_STANDARD">Non-Standard (+ΔX)</MenuItem>
          </Select>
        </FormControl>

        {(filterCustomer !== 'ALL' || filterERP !== 'ALL' || filterRAG !== 'ALL' || filterType !== 'ALL' || searchQuery) && (
          <Button
            size="small"
            onClick={() => {
              setFilterCustomer('ALL');
              setFilterERP('ALL');
              setFilterRAG('ALL');
              setFilterType('ALL');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        )}
      </Paper>

      {/* Portfolio Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project & Customer</TableCell>
                <TableCell>ERP System</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivery RAG</TableCell>
                <TableCell>Effort (Base + ΔX)</TableCell>
                <TableCell>Go-Live Commitment</TableCell>
                <TableCell>Assigned Devs</TableCell>
                <TableCell>Jira Key</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((proj) => {
                const customer = state.customers.find((c) => c.id === proj.customerId);
                const erp = state.erps.find((e) => e.id === proj.erpId);
                const assignedDevs = state.developers.filter((d) => proj.assignedDeveloperIds?.includes(d.id));

                return (
                  <TableRow
                    key={proj.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/project/${proj.id}`)}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {proj.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {customer?.name} ({customer?.segment})
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={erp?.name}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          backgroundColor: erp?.classification === 'Non-Standard' ? '#fff7ed' : '#eff6ff',
                          color: erp?.classification === 'Non-Standard' ? '#c2410c' : '#1d4ed8',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={proj.status}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          borderColor: proj.status === 'Blocked' ? '#ef4444' : '#cbd5e1',
                          color: proj.status === 'Blocked' ? '#ef4444' : 'text.primary',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <RAGBadge status={proj.rag} drivers={proj.ragDrivers} size="small" />
                    </TableCell>

                    <TableCell>
                      <EffortBreakdown
                        baseEffortDays={proj.baseEffortDays}
                        additionalEffortDays={proj.additionalEffortDays}
                        totalEffortDays={proj.totalEffortDays}
                        compact
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                        {proj.customerCommittedDate}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Est: {proj.plannedCompletionDate}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {assignedDevs.map((dev) => (
                          <Chip
                            key={dev.id}
                            label={dev.name.split(' ')[0]}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={proj.jiraProjectKey}
                        size="small"
                        sx={{
                          bgcolor: '#f1f5f9',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Project Modal (PRD Journey A) */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Register New ERP Delivery Project (Journey A)
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2.5 }}>
            <strong>Commitment & Capacity Feasibility Check:</strong> Entering standard and non-standard effort here allows the Control Tower to immediately evaluate developer capacity before Sales/Consulting makes irreversible Go-Live commitments.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Project Name"
                fullWidth
                size="small"
                required
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g. Apex Auto Parts — Global S/4HANA Finance Sync"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={newProject.customerId}
                  label="Customer"
                  onChange={(e) => setNewProject({ ...newProject, customerId: e.target.value })}
                >
                  {state.customers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} ({c.segment})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>ERP System</InputLabel>
                <Select
                  value={newProject.erpId}
                  label="ERP System"
                  onChange={(e) => {
                    const erp = state.erps.find((item) => item.id === e.target.value);
                    setNewProject({
                      ...newProject,
                      erpId: e.target.value,
                      baseEffortDays: erp?.baseEffortDays || 20,
                      additionalEffortDays: erp?.defaultDeltaDays || 0,
                      isNonStandard: erp?.classification === 'Non-Standard',
                    });
                  }}
                >
                  {state.erps.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.name} ({e.classification})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Effort fields */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Base ERP Effort (Days)"
                type="number"
                size="small"
                fullWidth
                value={newProject.baseEffortDays}
                onChange={(e) => setNewProject({ ...newProject, baseEffortDays: e.target.value })}
                helperText="Baseline standard effort (X)"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Non-Standard Delta (ΔX Days)"
                type="number"
                size="small"
                fullWidth
                value={newProject.additionalEffortDays}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    additionalEffortDays: e.target.value,
                    isNonStandard: Number(e.target.value) > 0,
                  })
                }
                helperText="Custom internal effort delta"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 1.5, border: '1px solid #bfdbfe' }}>
                <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700 }}>
                  TOTAL PLANNED EFFORT
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                  {Number(newProject.baseEffortDays) + Number(newProject.additionalEffortDays)} Days
                </Typography>
              </Box>
            </Grid>

            {/* Dates */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Planned Start Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newProject.plannedStartDate}
                onChange={(e) => setNewProject({ ...newProject, plannedStartDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Planned Completion Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newProject.plannedCompletionDate}
                onChange={(e) => setNewProject({ ...newProject, plannedCompletionDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Customer Go-Live Commitment"
                type="date"
                size="small"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newProject.customerCommittedDate}
                onChange={(e) => setNewProject({ ...newProject, customerCommittedDate: e.target.value })}
                helperText="Committed delivery date"
              />
            </Grid>

            {/* Assigned Developers */}
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Assigned Developer(s)</InputLabel>
                <Select
                  multiple
                  value={newProject.assignedDeveloperIds}
                  label="Assigned Developer(s)"
                  onChange={(e) => setNewProject({ ...newProject, assignedDeveloperIds: e.target.value })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((devId) => {
                        const d = state.developers.find((dev) => dev.id === devId);
                        return <Chip key={devId} label={d?.name || devId} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {state.developers.map((dev) => (
                    <MenuItem key={dev.id} value={dev.id}>
                      {dev.name} — {dev.role} ({dev.skills.slice(0, 2).join(', ')})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Project Description & Integration Scope"
                multiline
                rows={2}
                fullWidth
                size="small"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsCreateOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={!newProject.name}
            sx={{ fontWeight: 700 }}
          >
            Create Project & Sync to Jira
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
