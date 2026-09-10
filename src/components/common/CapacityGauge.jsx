import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

export default function CapacityGauge({ utilizationPct = 0, label = 'Utilization', showDetails = true }) {
  let color = '#10b981'; // Green
  let statusLabel = 'Healthy Bandwidth';

  if (utilizationPct > 100) {
    color = '#ef4444'; // Red
    statusLabel = 'Overallocated';
  } else if (utilizationPct > 75) {
    color = '#f59e0b'; // Amber
    statusLabel = 'High Utilization';
  }

  const clampedProgress = Math.min(utilizationPct, 100);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            color,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {utilizationPct}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={clampedProgress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e2e8f0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />

      {showDetails && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: '0.7rem' }}>
            {statusLabel}
          </Typography>
          {utilizationPct > 100 && (
            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.7rem' }}>
              +{utilizationPct - 100}% Over Capacity
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
