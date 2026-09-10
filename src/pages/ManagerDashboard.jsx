import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import AddTaskIcon from '@mui/icons-material/AddTask';
import GridOnIcon from '@mui/icons-material/GridOn';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReactECharts from 'echarts-for-react';
import { useApp } from '../data/store';
import { CapacityService } from '../services/CapacityService';
import { AllocationService } from '../services/AllocationService';
import KPICard from '../components/common/KPICard';
import RAGBadge from '../components/common/RAGBadge';

export default function ManagerDashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // View toggle for Supply vs Demand (Chart vs Matrix Table)
  const [supplyViewMode, setSupplyViewMode] = useState('chart'); // 'chart' | 'table'

  // Compute metrics
  const totalProjects = state.projects.length;
  const redProjects = state.projects.filter((p) => p.rag === 'RED');
  const amberProjects = state.projects.filter((p) => p.rag === 'AMBER');
  const greenProjects = state.projects.filter((p) => p.rag === 'GREEN');
  const criticalAttentionProjects = [...redProjects, ...amberProjects];

  // Heat map and team supply-demand calculations
  const { matrix } = CapacityService.getHeatMapMatrix(
    state.developers,
    state.allocations,
    state.projects,
    8
  );

  const overallocatedDevs = matrix.filter((m) => m.isCurrentlyOverallocated);
  const avgTeamUtilization = Math.round(
    matrix.reduce((acc, m) => acc + m.avgUtilization, 0) / (matrix.length || 1)
  );

  const supplyDemandData = CapacityService.getTeamSupplyDemandTable(
    state.developers,
    state.allocations,
    8
  );

  // Net forward buffer in days across 8 weeks
  const totalAvailableDays = supplyDemandData.reduce((acc, d) => acc + d.teamCapacityDays, 0);
  const totalDemandDays = supplyDemandData.reduce((acc, d) => acc + d.plannedDemandDays, 0);
  const forwardNetBalanceDays = totalAvailableDays - totalDemandDays;

  // What-if simulator state (Consolidated from Capacity Planning)
  const [simDevId, setSimDevId] = useState(state.developers[0]?.id || '');
  const [simProjId, setSimProjId] = useState(state.projects[0]?.id || '');
  const [simWeek, setSimWeek] = useState(2);
  const [simAllocPct, setSimAllocPct] = useState(40);
  const [simResult, setSimResult] = useState(null);

  const selectedDev = state.developers.find((d) => d.id === simDevId);
  const selectedProj = state.projects.find((p) => p.id === simProjId);

  const handleSimulate = () => {
    if (!selectedDev) return;

    const preview = AllocationService.previewAllocationImpact(
      selectedDev,
      state.allocations,
      Number(simWeek),
      Number(simAllocPct)
    );
    setSimResult(preview);
  };

  const handleApplySimulatedAllocation = () => {
    if (!selectedDev || !selectedProj) return;

    dispatch({
      type: 'ADD_ALLOCATION',
      payload: {
        id: `alloc-${Date.now()}`,
        developerId: selectedDev.id,
        projectId: selectedProj.id,
        weekIndex: Number(simWeek),
        allocationPct: Number(simAllocPct),
        hours: (Number(simAllocPct) / 100) * selectedDev.weeklyCapacityHours,
      },
    });

    setSimResult(null);
  };

  // ECharts Option: Team Capacity vs Demand
  const supplyDemandChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['Team Capacity (Days)', 'Planned Demand (Days)', 'Capacity Gap / Surplus'],
      bottom: 0,
      textStyle: { fontSize: 12, fontFamily: 'Plus Jakarta Sans' },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: supplyDemandData.map((d) => d.weekLabel),
      axisLine: { lineStyle: { color: '#cbd5e1' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Work Days',
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      {
        type: 'value',
        name: 'Gap (Days)',
        show: false,
      },
    ],
    series: [
      {
        name: 'Team Capacity (Days)',
        type: 'bar',
        data: supplyDemandData.map((d) => d.teamCapacityDays),
        itemStyle: { color: '#94a3b8', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Planned Demand (Days)',
        type: 'bar',
        data: supplyDemandData.map((d) => d.plannedDemandDays),
        itemStyle: {
          color: (params) => (params.value > 40 ? '#ef4444' : '#2563eb'),
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Capacity Gap / Surplus',
        type: 'line',
        yAxisIndex: 1,
        data: supplyDemandData.map((d) => d.gapDays),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
      },
    ],
  };

  // ECharts Option: RAG Distribution Donut
  const ragDonutOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', textStyle: { fontSize: 11 } },
    color: ['#10b981', '#f59e0b', '#ef4444'],
    series: [
      {
        name: 'Project Health',
        type: 'pie',
        radius: ['50%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            formatter: '{b}\n{c} projects',
          },
        },
        data: [
          { value: greenProjects.length, name: 'On Track (Green)' },
          { value: amberProjects.length, name: 'At Risk (Amber)' },
          { value: redProjects.length, name: 'Critical (Red)' },
        ],
      },
    ],
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Executive Command Center
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Unified delivery health, forward supply vs demand forecasting, risk alerts, and what-if simulation.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/heatmap')}
            startIcon={<GridOnIcon />}
            sx={{ fontWeight: 700 }}
          >
            Team Heat Map
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/portfolio')}
            startIcon={<AddIcon />}
            sx={{ fontWeight: 700 }}
          >
            Create ERP Project
          </Button>
        </Box>
      </Box>

      {/* Critical Overallocation & Risk Alert Banner */}
      {redProjects.length > 0 && (
        <Alert
          severity="error"
          sx={{ borderRadius: 2, border: '1px solid #fecaca', bgcolor: '#fef2f2' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/portfolio')}>
              View Portfolio
            </Button>
          }
        >
          <strong>{redProjects.length} ERP Delivery Commitments are at Critical Risk (RED):</strong>{' '}
          {redProjects.map((p) => p.name).join('; ')}
        </Alert>
      )}

      {/* Top KPI Metrics Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Total ERP Projects"
            value={totalProjects}
            subtitle="6 Customers · 5 ERP Types"
            icon={<FolderSpecialIcon />}
            color="#2563eb"
            onClick={() => navigate('/portfolio')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Avg Team Utilization"
            value={`${avgTeamUtilization}%`}
            subtitle="8 Full-Time ERP Developers"
            icon={<SpeedIcon />}
            color={avgTeamUtilization > 85 ? '#f59e0b' : '#10b981'}
            onClick={() => navigate('/heatmap')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Overallocated Devs"
            value={overallocatedDevs.length}
            subtitle={
              overallocatedDevs.length > 0
                ? `${overallocatedDevs.map((m) => m.developer.name.split(' ')[0]).join(', ')} exceed 100%`
                : 'All developers within limits'
            }
            icon={<ErrorOutlineIcon />}
            color="#ef4444"
            onClick={() => navigate('/heatmap')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Commitments At Risk"
            value={`${criticalAttentionProjects.length}`}
            subtitle={`${redProjects.length} Critical (Red) · ${amberProjects.length} Amber`}
            icon={<WarningAmberIcon />}
            color="#f59e0b"
            onClick={() => navigate('/portfolio')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="8-Wk Net Balance"
            value={`${forwardNetBalanceDays > 0 ? '+' : ''}${forwardNetBalanceDays}d`}
            subtitle={`${totalAvailableDays}d Supply vs ${totalDemandDays}d Demand`}
            icon={<CalculateIcon />}
            color={forwardNetBalanceDays >= 0 ? '#10b981' : '#ef4444'}
            onClick={() => setSupplyViewMode(supplyViewMode === 'chart' ? 'table' : 'chart')}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Supply vs Demand Section (with Chart & Matrix Table toggle) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Team Capacity Supply vs Planned Demand (PRD §11)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Forward-looking 8-week horizon (40 days team capacity/week)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={supplyViewMode === 'chart' ? 'contained' : 'outlined'}
                  startIcon={<BarChartIcon />}
                  onClick={() => setSupplyViewMode('chart')}
                  sx={{ fontSize: '0.75rem', py: 0.2 }}
                >
                  Chart
                </Button>
                <Button
                  size="small"
                  variant={supplyViewMode === 'table' ? 'contained' : 'outlined'}
                  startIcon={<TableChartIcon />}
                  onClick={() => setSupplyViewMode('table')}
                  sx={{ fontSize: '0.75rem', py: 0.2 }}
                >
                  Matrix Table
                </Button>
              </Box>
            </Box>

            {supplyViewMode === 'chart' ? (
              <Box sx={{ flex: 1, minHeight: 280 }}>
                <ReactECharts option={supplyDemandChartOption} style={{ height: 280 }} />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 280 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell align="right">Supply</TableCell>
                      <TableCell align="right">Demand</TableCell>
                      <TableCell align="right">Net Gap</TableCell>
                      <TableCell align="right">Utilization</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplyDemandData.map((row) => (
                      <TableRow key={row.weekIndex} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{row.weekLabel}</TableCell>
                        <TableCell align="right">{row.teamCapacityDays}d</TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, color: row.hasDeficit ? '#ef4444' : 'text.primary' }}
                        >
                          {row.plannedDemandDays}d
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 800, color: row.hasDeficit ? '#ef4444' : '#16a34a' }}
                        >
                          {row.gapDays > 0 ? `+${row.gapDays}` : row.gapDays}d
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${row.utilizationPct}%`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              bgcolor: row.utilizationPct > 100 ? '#fee2e2' : row.utilizationPct > 80 ? '#fef3c7' : '#ecfdf5',
                              color: row.utilizationPct > 100 ? '#b91c1c' : row.utilizationPct > 80 ? '#b45309' : '#047857',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {row.hasDeficit ? (
                            <Chip label="DEFICIT" size="small" color="error" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                          ) : (
                            <Chip label="BUFFER" size="small" color="success" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* RAG Distribution Donut */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
              Delivery Risk Distribution (PRD §17)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
              Deterministic operational health evaluation
            </Typography>
            <Box sx={{ flex: 1, minHeight: 220 }}>
              <ReactECharts option={ragDonutOption} style={{ height: 240 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Operational Row: High Attention Delivery Commitments + What-If Simulator */}
      <Grid container spacing={3}>
        {/* Left: High Attention Delivery Commitments (Solves portfolio table redundancy) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  High-Attention Delivery Commitments
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Projects with active risk triggers requiring immediate capacity or date review
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/portfolio')}
                sx={{ fontWeight: 700 }}
              >
                Full Portfolio ({totalProjects})
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
              {criticalAttentionProjects.length > 0 ? (
                criticalAttentionProjects.map((proj) => {
                  const customer = state.customers.find((c) => c.id === proj.customerId);
                  const erp = state.erps.find((e) => e.id === proj.erpId);

                  return (
                    <Card
                      key={proj.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderColor: proj.rag === 'RED' ? '#fecaca' : '#fed7aa',
                        bgcolor: proj.rag === 'RED' ? '#fffafb' : '#fffdfa',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
                      }}
                      onClick={() => navigate(`/project/${proj.id}`)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {proj.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {customer?.name} · {erp?.name}
                          </Typography>
                        </Box>
                        <RAGBadge status={proj.rag} size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Committed Go-Live: <strong>{proj.customerCommittedDate}</strong> (Plan: {proj.plannedCompletionDate})
                        </Typography>
                        <Tooltip title="View Project Details">
                          <IconButton size="small" color="primary">
                            <ArrowForwardIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  );
                })
              ) : (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  All projects are currently on track (GREEN).
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right: What-If Allocation Impact Simulator (PRD §22) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalculateIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                What-If Allocation Impact Simulator (PRD §22)
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Simulate assigning developer capacity before committing customer dates or changing schedules.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Developer</InputLabel>
                  <Select
                    value={simDevId}
                    label="Developer"
                    onChange={(e) => {
                      setSimDevId(e.target.value);
                      setSimResult(null);
                    }}
                  >
                    {state.developers.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name} ({d.role.split(' ')[0]})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={simProjId}
                    label="Project"
                    onChange={(e) => {
                      setSimProjId(e.target.value);
                      setSimResult(null);
                    }}
                  >
                    {state.projects.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name.slice(0, 24)}...
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Target Week</InputLabel>
                  <Select
                    value={simWeek}
                    label="Target Week"
                    onChange={(e) => {
                      setSimWeek(e.target.value);
                      setSimResult(null);
                    }}
                  >
                    {Array.from({ length: 8 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        Week {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Planned Allocation %"
                  type="number"
                  fullWidth
                  size="small"
                  value={simAllocPct}
                  onChange={(e) => {
                    setSimAllocPct(e.target.value);
                    setSimResult(null);
                  }}
                  helperText={`${(simAllocPct / 100) * 40} hours/week`}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleSimulate}
                  sx={{ fontWeight: 700 }}
                >
                  Calculate Capacity Impact
                </Button>
              </Grid>

              {/* Simulation Result Preview */}
              {simResult && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: simResult.willBeOverallocated ? '#fef2f2' : '#f0fdf4',
                      border: '1px solid',
                      borderColor: simResult.willBeOverallocated ? '#fca5a5' : '#bbf7d0',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: simResult.willBeOverallocated ? '#991b1b' : '#166534',
                        mb: 1,
                      }}
                    >
                      {simResult.willBeOverallocated ? '⚠️ Over-Allocation Warning' : '✓ Capacity Feasible'}
                    </Typography>

                    <Typography variant="body2" sx={{ fontSize: '0.825rem', mb: 0.5 }}>
                      Current Allocation: <strong>{simResult.currentTotalPct}%</strong> ({simResult.currentHours}h)
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.825rem', mb: 1 }}>
                      Projected Allocation: <strong>{simResult.projectedTotalPct}%</strong> ({simResult.projectedHours}h / 40h)
                    </Typography>

                    {simResult.willBeOverallocated ? (
                      <Alert severity="error" sx={{ py: 0.5, mb: 1.5 }}>
                        Exceeds 40h capacity by <strong>{simResult.overtimeHours} hours</strong>. This will create delivery risk.
                      </Alert>
                    ) : (
                      <Alert severity="success" sx={{ py: 0.5, mb: 1.5 }}>
                        Developer will retain <strong>{simResult.availableHoursRemaining} hours</strong> of available bandwidth.
                      </Alert>
                    )}

                    <Button
                      variant="contained"
                      color={simResult.willBeOverallocated ? 'error' : 'primary'}
                      fullWidth
                      startIcon={<AddTaskIcon />}
                      onClick={handleApplySimulatedAllocation}
                      sx={{ fontWeight: 700 }}
                    >
                      Apply Allocation to Project
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
