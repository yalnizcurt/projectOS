import React from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import FunctionsIcon from '@mui/icons-material/Functions';

export default function EffortBreakdown({
  baseEffortDays = 0,
  additionalEffortDays = 0,
  totalEffortDays = 0,
  compact = false,
}) {
  const total = totalEffortDays || baseEffortDays + additionalEffortDays;
  const isNonStandard = additionalEffortDays > 0;

  if (compact) {
    return (
      <Tooltip
        title={`Standard Baseline: ${baseEffortDays}d + Non-Standard Delta: ${additionalEffortDays}d = Total: ${total}d`}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {total}d
          </Typography>
          {isNonStandard && (
            <Chip
              label={`+${additionalEffortDays}d Δ`}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: '#fff7ed',
                color: '#c2410c',
                border: '1px solid #ffedd5',
              }}
            />
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isNonStandard ? '#fdba74' : 'divider',
        backgroundColor: isNonStandard ? '#fffaf5' : '#f8fafc',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.04em' }}>
          ERP Planned Effort Architecture (PRD §8)
        </Typography>
        {isNonStandard ? (
          <Chip label="Non-Standard Integration" color="warning" size="small" sx={{ fontWeight: 700, height: 22 }} />
        ) : (
          <Chip label="Standard Integration Baseline" color="success" size="small" sx={{ fontWeight: 700, height: 22 }} />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        {/* Base effort */}
        <Box sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', minWidth: 100 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Base ERP (X)
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontFamily: 'JetBrains Mono, monospace' }}>
            {baseEffortDays} <Typography component="span" variant="caption">days</Typography>
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          +
        </Typography>

        {/* Non standard effort delta */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            bgcolor: isNonStandard ? '#ffedd5' : '#f1f5f9',
            border: '1px solid',
            borderColor: isNonStandard ? '#fdba74' : '#cbd5e1',
            minWidth: 120,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: isNonStandard ? '#9a3412' : 'text.secondary', fontWeight: 600 }}>
              Scope Delta (ΔX)
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: isNonStandard ? '#c2410c' : 'text.secondary',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {additionalEffortDays > 0 ? `+${additionalEffortDays}` : '0'} <Typography component="span" variant="caption">days</Typography>
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          =
        </Typography>

        {/* Total Effort */}
        <Box sx={{ px: 2, py: 1, borderRadius: 1.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', minWidth: 120 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FunctionsIcon sx={{ fontSize: 14, color: '#1d4ed8' }} />
            <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700 }}>
              Total Effort
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e40af', fontFamily: 'JetBrains Mono, monospace' }}>
            {total} <Typography component="span" variant="caption">days</Typography>
          </Typography>
        </Box>
      </Box>

      {isNonStandard && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#9a3412', fontWeight: 500 }}>
          * Notice: Non-standard delta (+{additionalEffortDays} days) is explicitly tracked to prevent hidden scope creep and downstream delays.
        </Typography>
      )}
    </Box>
  );
}
