import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

export default function AuditTimeline({ auditLogs = [] }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No audit records logged yet.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 140 }}>Timestamp</TableCell>
            <TableCell sx={{ width: 120 }}>Actor / Source</TableCell>
            <TableCell sx={{ width: 130 }}>Entity</TableCell>
            <TableCell>Field Changed</TableCell>
            <TableCell>Old Value</TableCell>
            <TableCell>New Value</TableCell>
            <TableCell>Context / Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {auditLogs.map((log) => (
            <TableRow key={log.id} hover>
              <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                {new Date(log.timestamp).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell>
                <Chip
                  label={log.actor}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    backgroundColor: log.actor.includes('Jira') ? '#e0f2fe' : '#f1f5f9',
                    color: log.actor.includes('Jira') ? '#0369a1' : 'text.primary',
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {log.entityType} ({log.entityId})
                </Typography>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#1e40af', fontSize: '0.8rem' }}>
                {log.field}
              </TableCell>
              <TableCell sx={{ color: '#dc2626', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                {log.oldValue || '—'}
              </TableCell>
              <TableCell sx={{ color: '#16a34a', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                {log.newValue || '—'}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                {log.reason}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
