import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  Divider,
} from '@mui/material';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { useApp } from '../../data/store';
import { SyncService } from '../../services/SyncService';

export default function MockJiraSimulatorModal({ open, onClose }) {
  const { state, dispatch } = useApp();
  const [selectedTaskKey, setSelectedTaskKey] = useState(state.tasks[0]?.jiraIssueKey || '');
  const [newStatus, setNewStatus] = useState('In Progress');
  const [remainingHours, setRemainingHours] = useState(8);
  const [successMessage, setSuccessMessage] = useState('');

  const currentTask = state.tasks.find((t) => t.jiraIssueKey === selectedTaskKey);

  const handleSimulateSync = () => {
    if (!selectedTaskKey) return;

    SyncService.simulateInboundJiraEvent(
      dispatch,
      selectedTaskKey,
      newStatus,
      Number(remainingHours)
    );

    setSuccessMessage(
      `Synced! ${selectedTaskKey} status updated to "${newStatus}" (${remainingHours}h remaining). Control Tower updated without page reload.`
    );

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <SyncAltIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Mock Jira Sync Event Simulator
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2.5 }}>
          <strong>PRD Section 38 & 47 Simulation:</strong> Simulate an ERP developer updating their task directly in Jira. Watch how the Control Tower immediately updates remaining work, developer bandwidth, and project RAG.
        </Alert>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Jira Issue</InputLabel>
            <Select
              value={selectedTaskKey}
              label="Select Jira Issue"
              onChange={(e) => {
                const key = e.target.value;
                setSelectedTaskKey(key);
                const t = state.tasks.find((task) => task.jiraIssueKey === key);
                if (t) {
                  setNewStatus(t.status);
                  setRemainingHours(t.remainingHours);
                }
              }}
            >
              {state.tasks.map((task) => (
                <MenuItem key={task.id} value={task.jiraIssueKey}>
                  <strong>{task.jiraIssueKey}</strong> — {task.title} ({task.status})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {currentTask && (
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                CURRENT CONTROL TOWER STATE:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Status: <span style={{ color: '#2563eb' }}>{currentTask.status}</span> | Remaining: {currentTask.remainingHours}h | Estimate: {currentTask.estimatedHours}h
              </Typography>
            </Box>
          )}

          <Divider />

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Simulate Change Made in Jira:
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>New Jira Status</InputLabel>
            <Select
              value={newStatus}
              label="New Jira Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="In Review">In Review</MenuItem>
              <MenuItem value="Done">Done (0h Remaining)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Updated Remaining Hours"
            type="number"
            size="small"
            value={remainingHours}
            onChange={(e) => setRemainingHours(e.target.value)}
            fullWidth
            helperText="Simulates developer logging work in Jira and adjusting remaining effort"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayCircleFilledWhiteIcon />}
          onClick={handleSimulateSync}
        >
          Push Webhook Event to Control Tower
        </Button>
      </DialogActions>
    </Dialog>
  );
}
