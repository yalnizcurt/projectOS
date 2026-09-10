import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Link,
  Tooltip,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LanguageIcon from '@mui/icons-material/Language';
import DescriptionIcon from '@mui/icons-material/Description';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function CitationCard({ citation, index }) {
  if (!citation) return null;

  const isGoogleDoc = citation.sourceType === 'GOOGLE_DOC' || citation.sourceUrl?.includes('docs.google.com');
  const isWebPage = citation.sourceType === 'WEB_PAGE';
  const isPlaybook = citation.sourceType === 'PLAYBOOK' || (!isGoogleDoc && !isWebPage);

  const getSourceIcon = () => {
    if (isGoogleDoc) return <DescriptionIcon sx={{ fontSize: 16, color: '#0284c7' }} />;
    if (isWebPage) return <LanguageIcon sx={{ fontSize: 16, color: '#16a34a' }} />;
    return <MenuBookIcon sx={{ fontSize: 16, color: '#2563eb' }} />;
  };

  const getSourceTypeLabel = () => {
    if (isGoogleDoc) return 'Google Doc (Authenticated)';
    if (isWebPage) return 'Linked Web Doc';
    return 'Playbook';
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: '#f8fafc',
        borderColor: '#e2e8f0',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#93c5fd',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
          bgcolor: '#ffffff',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              bgcolor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#334155',
            }}
          >
            {index ? `[${index}]` : getSourceIcon()}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
              {citation.documentName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
              v{citation.version || '1.0'} · Section: <strong>{citation.section || 'General'}</strong>
              {citation.page ? ` · Page ${citation.page}` : ''}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={getSourceTypeLabel()}
          size="small"
          icon={isGoogleDoc ? <LockIcon sx={{ fontSize: '12px !important' }} /> : undefined}
          sx={{
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: isGoogleDoc ? '#e0f2fe' : isWebPage ? '#dcfce7' : '#eff6ff',
            color: isGoogleDoc ? '#0369a1' : isWebPage ? '#15803d' : '#1d4ed8',
          }}
        />
      </Box>

      {citation.sourceUrl && (
        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            URL:
          </Typography>
          <Link
            href={citation.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '0.72rem',
              color: '#2563eb',
              textDecoration: 'none',
              fontFamily: 'monospace',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.3,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {citation.sourceUrl}
            <OpenInNewIcon sx={{ fontSize: 11 }} />
          </Link>
        </Box>
      )}

      {citation.parentSourceUrl && (
        <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8', fontSize: '0.68rem', mt: 0.3 }}>
          Discovered via: <em>{citation.parentSourceUrl}</em>
        </Typography>
      )}
    </Paper>
  );
}
