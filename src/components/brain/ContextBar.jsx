import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useApp } from '../../data/store';

export default function ContextBar({ context, onContextChange }) {
  const { state } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Local dialog selection state
  const [selectedErpId, setSelectedErpId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const handleOpenDialog = () => {
    const currentErp = state.erps.find((e) => e.name === context.erp);
    setSelectedErpId(currentErp?.id || '');
    setSelectedProjectId(context.projectId || '');
    setIsDialogOpen(true);
  };

  const handleApply = () => {
    const erpObj = state.erps.find((e) => e.id === selectedErpId);
    const projObj = state.projects.find((p) => p.id === selectedProjectId);
    const custObj = projObj ? state.customers.find((c) => c.id === projObj.customerId) : null;

    onContextChange({
      erp: erpObj ? erpObj.name : null,
      customer: custObj || null,
      project: projObj || null,
      jiraTask: null, // Reset task if changing project
    });

    setIsDialogOpen(false);
  };

  const handleResetToAll = () => {
    onContextChange({
      erp: null,
      customer: null,
      project: null,
      jiraTask: null,
    });
    setIsDialogOpen(false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        px: 2,
        borderRadius: 2.5,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      {/* Context Chips */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 0.5 }}>
          <PsychologyIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', letterSpacing: '0.04em' }}>
            ACTIVE CONTEXT:
          </Typography>
        </Box>

        {context.erp ? (
          <Chip
            label={context.erp}
            size="small"
            color="primary"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        ) : (
          <Chip
            label="All ERPs (Unfiltered)"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem', borderColor: '#cbd5e1' }}
          />
        )}

        {context.customer?.name && (
          <Chip
            icon={<BusinessIcon sx={{ fontSize: '13px !important' }} />}
            label={context.customer.name}
            size="small"
            sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: '0.75rem' }}
          />
        )}

        {context.project?.name && (
          <Chip
            label={context.project.name}
            size="small"
            sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: '0.75rem' }}
          />
        )}

        {context.jiraTask?.jiraIssueKey && (
          <Chip
            icon={<AssignmentIcon sx={{ fontSize: '13px !important' }} />}
            label={`${context.jiraTask.jiraIssueKey}: ${context.jiraTask.title?.slice(0, 24)}...`}
            size="small"
            sx={{
              bgcolor: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: 700,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
            }}
          />
        )}
      </Box>

      {/* Change Context Button */}
      <Button
        size="small"
        variant="outlined"
        startIcon={<TuneIcon />}
        onClick={handleOpenDialog}
        sx={{
          borderRadius: 2,
          fontSize: '0.75rem',
          textTransform: 'none',
          py: 0.4,
          borderColor: '#cbd5e1',
          color: '#334155',
          '&:hover': { borderColor: '#2563eb', bgcolor: '#f8fafc' },
        }}
      >
        Change Context
      </Button>

      {/* Context Selection Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Select Knowledge Retrieval Context</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
            Setting an ERP context prioritizes documentation specifically for that platform and filters out irrelevant ERP architectures.
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Target ERP System</InputLabel>
            <Select
              value={selectedErpId}
              label="Target ERP System"
              onChange={(e) => setSelectedErpId(e.target.value)}
            >
              <MenuItem value="">
                <em>All ERPs (General Search)</em>
              </MenuItem>
              {state.erps.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Associated Project (Optional)</InputLabel>
            <Select
              value={selectedProjectId}
              label="Associated Project (Optional)"
              onChange={(e) => {
                const pid = e.target.value;
                setSelectedProjectId(pid);
                const proj = state.projects.find((p) => p.id === pid);
                if (proj && !selectedErpId) {
                  setSelectedErpId(proj.erpId);
                }
              }}
            >
              <MenuItem value="">
                <em>None (Independent Search)</em>
              </MenuItem>
              {state.projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleResetToAll} color="inherit" size="small">
            Clear Context
          </Button>
          <Button onClick={handleApply} variant="contained" size="small">
            Apply Context
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
