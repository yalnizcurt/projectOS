import React, { useState } from 'react';
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
  Drawer,
  IconButton,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  Alert,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonIcon from '@mui/icons-material/Person';
import { useApp } from '../data/store';
import { CapacityService } from '../services/CapacityService';
import RAGBadge from '../components/common/RAGBadge';
import CapacityGauge from '../components/common/CapacityGauge';

export default function HeatMap() {
  const { state, dispatch } = useApp();

  // Filters
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedDevId, setSelectedDevId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Drilldown Drawer State
  const [drilldownData, setDrilldownData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reallocation Modal within Drawer
  const [isReallocating, setIsReallocating] = useState(false);
  const [reallocTargetDevId, setReallocTargetDevId] = useState('');
  const [reallocProjectId, setReallocProjectId] = useState('');

  // Thresholds (configurable PRD §10)
  const [greenThreshold] = useState(75);
  const [amberThreshold] = useState(95);

  const { weekLabels, matrix } = CapacityService.getHeatMapMatrix(
    state.developers,
    state.allocations,
    state.projects,
    8
  );

  // Filter matrix
  const filteredMatrix = matrix.filter((item) => {
    if (selectedTeam !== 'ALL' && item.developer.team !== selectedTeam) return false;
    if (selectedDevId !== 'ALL' && item.developer.id !== selectedDevId) return false;
    if (searchQuery && !item.developer.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const teams = Array.from(new Set(state.developers.map((d) => d.team)));

  const handleCellClick = (developer, weekData) => {
    setDrilldownData({ developer, weekData });
    setIsDrawerOpen(true);
    setIsReallocating(false);
  };

  const handleApplyReallocation = () => {
    if (!drilldownData || !reallocTargetDevId || !reallocProjectId) return;

    const sourceDevId = drilldownData.developer.id;
    const weekIdx = drilldownData.weekData.weekIndex;
    const currentAlloc = drilldownData.weekData.projectBreakdown.find(
      (p) => p.projectId === reallocProjectId
    );

    if (!currentAlloc) return;

    dispatch({
      type: 'REALLOCATE_DEVELOPER',
      payload: {
        sourceDeveloperId: sourceDevId,
        targetDeveloperId: reallocTargetDevId,
        projectId: reallocProjectId,
        weekIndex: weekIdx,
        allocationPct: currentAlloc.allocationPct,
        hours: currentAlloc.hours,
      },
    });

    setIsReallocating(false);
    setIsDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Developer Availability Heat Map
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            PRD Section 10: Multi-week visual representation of developer bandwidth, over-allocation, and project commitments.
          </Typography>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#dcfce7', border: '1px solid #86efac' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>&lt;{greenThreshold}% (Healthy)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#fef3c7', border: '1px solid #fde68a' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{greenThreshold}-{amberThreshold}% (Approaching)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#fee2e2', border: '1px solid #fca5a5' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>&gt;{amberThreshold}% (Overallocated)</Typography>
          </Box>
        </Box>
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FilterListIcon sx={{ color: 'text.secondary' }} />
        <TextField
          size="small"
          label="Search Developer"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Team</InputLabel>
          <Select
            value={selectedTeam}
            label="Filter by Team"
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <MenuItem value="ALL">All Teams ({state.developers.length})</MenuItem>
            {teams.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Developer</InputLabel>
          <Select
            value={selectedDevId}
            label="Developer"
            onChange={(e) => setSelectedDevId(e.target.value)}
          >
            <MenuItem value="ALL">All Developers</MenuItem>
            {state.developers.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(selectedTeam !== 'ALL' || selectedDevId !== 'ALL' || searchQuery) && (
          <Button
            size="small"
            onClick={() => {
              setSelectedTeam('ALL');
              setSelectedDevId('ALL');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        )}
      </Paper>

      {/* Heat Map Grid */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200, bgcolor: '#f8fafc', zIndex: 11 }}>
                  Developer & Team
                </TableCell>
                <TableCell sx={{ width: 90, textAlign: 'center', bgcolor: '#f8fafc', zIndex: 11 }}>
                  Avg Util.
                </TableCell>
                {weekLabels.map((w) => (
                  <TableCell key={w} sx={{ textAlign: 'center', minWidth: 105, bgcolor: '#f8fafc', zIndex: 11 }}>
                    {w}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMatrix.map(({ developer, weeks, avgUtilization, isCurrentlyOverallocated }) => (
                <TableRow key={developer.id} hover>
                  {/* Dev Name Cell */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        {developer.avatar}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {developer.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {developer.role} · {developer.team}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Avg Utilization */}
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip
                      label={`${avgUtilization}%`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        bgcolor: avgUtilization > 95 ? '#fee2e2' : avgUtilization > 75 ? '#fef3c7' : '#ecfdf5',
                        color: avgUtilization > 95 ? '#b91c1c' : avgUtilization > 75 ? '#b45309' : '#047857',
                      }}
                    />
                  </TableCell>

                  {/* Week Matrix Cells */}
                  {weeks.map((week) => {
                    const isRed = week.status === 'RED';
                    const isAmber = week.status === 'AMBER';

                    let cellBg = '#f0fdf4'; // Healthy green
                    let cellBorder = '#bbf7d0';
                    let cellText = '#15803d';

                    if (isRed) {
                      cellBg = '#fef2f2'; // Red
                      cellBorder = '#fecaca';
                      cellText = '#b91c1c';
                    } else if (isAmber) {
                      cellBg = '#fffbeb'; // Amber
                      cellBorder = '#fde68a';
                      cellText = '#b45309';
                    }

                    return (
                      <TableCell
                        key={week.weekIndex}
                        onClick={() => handleCellClick(developer, week)}
                        sx={{
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: cellBg,
                          borderLeft: `1px solid ${cellBorder}`,
                          borderRight: `1px solid ${cellBorder}`,
                          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                          '&:hover': {
                            transform: 'scale(1.04)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                            zIndex: 2,
                            position: 'relative',
                          },
                        }}
                      >
                        <Tooltip
                          title={`Click to drill down: ${week.utilizationPct}% allocated (${week.allocatedHours}h / 40h)`}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: cellText,
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '0.825rem',
                              }}
                            >
                              {week.utilizationPct}%
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: cellText,
                                opacity: 0.85,
                                fontSize: '0.68rem',
                                display: 'block',
                              }}
                            >
                              {week.availableHours > 0 ? `${week.availableHours}h free` : `+${week.overtimeHours}h over`}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Drill-down Drawer (PRD §10 Drilldown) */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: 340, sm: 460 }, p: 3 },
        }}
      >
        {drilldownData && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Drawer Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em' }}>
                  DEVELOPER ALLOCATION DRILL-DOWN
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {drilldownData.developer.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {drilldownData.developer.role} · {drilldownData.weekData.weekLabel}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setIsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider />

            {/* Capacity KPI Overview */}
            <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Capacity Status for {drilldownData.weekData.weekLabel}
              </Typography>
              <CapacityGauge
                utilizationPct={drilldownData.weekData.utilizationPct}
                label="Total Weekly Allocation"
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 2 }}>
                <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Total Cap.</Typography>
                  <Typography variant="subtitle2" fontWeight={800}>40 hrs</Typography>
                </Box>
                <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Allocated</Typography>
                  <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                    {drilldownData.weekData.allocatedHours} hrs
                  </Typography>
                </Box>
                <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Available</Typography>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color={drilldownData.weekData.overtimeHours > 0 ? 'error.main' : 'success.main'}
                  >
                    {drilldownData.weekData.overtimeHours > 0
                      ? `-${drilldownData.weekData.overtimeHours}h`
                      : `${drilldownData.weekData.availableHours}h`}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Allocated Projects in this period */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Assigned Customer Projects ({drilldownData.weekData.projectBreakdown.length})
              </Typography>

              {drilldownData.weekData.projectBreakdown.length === 0 ? (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  No projects currently allocated for this week. Developer is 100% available.
                </Alert>
              ) : (
                <List dense sx={{ p: 0 }}>
                  {drilldownData.weekData.projectBreakdown.map((item) => (
                    <ListItem
                      key={item.projectId}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        bgcolor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.projectName}
                        </Typography>
                        <RAGBadge status={item.projectRag} size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Allocation: <strong>{item.allocationPct}%</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                          {item.hours} hours
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* Reallocation Panel (PRD §21 Reallocation Visibility) */}
            <Divider />

            {!isReallocating ? (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<SwapHorizIcon />}
                onClick={() => {
                  setIsReallocating(true);
                  if (drilldownData.weekData.projectBreakdown.length > 0) {
                    setReallocProjectId(drilldownData.weekData.projectBreakdown[0].projectId);
                  }
                }}
                disabled={drilldownData.weekData.projectBreakdown.length === 0}
                fullWidth
              >
                Reallocate Work to Another Developer
              </Button>
            ) : (
              <Paper sx={{ p: 2, bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e', mb: 1.5 }}>
                  Reallocate Resource (PRD §21)
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Project Allocation</InputLabel>
                    <Select
                      value={reallocProjectId}
                      label="Select Project Allocation"
                      onChange={(e) => setReallocProjectId(e.target.value)}
                    >
                      {drilldownData.weekData.projectBreakdown.map((p) => (
                        <MenuItem key={p.projectId} value={p.projectId}>
                          {p.projectName} ({p.allocationPct}%)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Target Developer (With Capacity)</InputLabel>
                    <Select
                      value={reallocTargetDevId}
                      label="Target Developer (With Capacity)"
                      onChange={(e) => setReallocTargetDevId(e.target.value)}
                    >
                      {state.developers
                        .filter((d) => d.id !== drilldownData.developer.id)
                        .map((d) => (
                          <MenuItem key={d.id} value={d.id}>
                            {d.name} ({d.role.split(' ')[0]})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                    <Button size="small" onClick={() => setIsReallocating(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      onClick={handleApplyReallocation}
                      disabled={!reallocTargetDevId || !reallocProjectId}
                    >
                      Confirm Reallocation
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
