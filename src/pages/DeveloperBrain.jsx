import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';

import ContextBar from '../components/brain/ContextBar';
import BrainChatPanel from '../components/brain/BrainChatPanel';

export default function DeveloperBrain() {
  const [activeContext, setActiveContext] = useState({
    erp: 'SAP S/4HANA', // default initial context for testing §42 scenario
    customer: null,
    project: null,
    jiraTask: null,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <PsychologyIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              ERP Developer Brain
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Technical knowledge assistant grounded in approved ERP playbooks, linked guides, and authenticated specifications.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Context Selector Bar (§16, §34) */}
      <ContextBar context={activeContext} onContextChange={setActiveContext} />

      {/* Main Chat Panel Container */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          p: 2.5,
          borderRadius: 3,
          bgcolor: '#ffffff',
          borderColor: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <BrainChatPanel context={activeContext} isCompact={false} />
      </Paper>
    </Box>
  );
}
