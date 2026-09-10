import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HubIcon from '@mui/icons-material/Hub';
import LinkIcon from '@mui/icons-material/Link';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';

export default function EvidenceDrawer({ open, onClose, evidence = [], question = '' }) {
  const [expandedChunkId, setExpandedChunkId] = useState(null);

  const handleAccordionChange = (chunkId) => (event, isExpanded) => {
    setExpandedChunkId(isExpanded ? chunkId : null);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 540, md: 620 },
          p: 0,
          bgcolor: '#f8fafc',
          boxSizing: 'border-box',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HubIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              Retrieved Evidence & Provenance
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {evidence.length} source chunks used to synthesize the grounded answer
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Query Context Pill */}
      {question && (
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            PROMPT / QUESTION
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.2 }}>
            "{question}"
          </Typography>
        </Box>
      )}

      {/* Evidence Chunks List */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {evidence.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
            <Typography variant="body2">No evidence chunks were retrieved for this query.</Typography>
          </Box>
        ) : (
          evidence.map((item, idx) => {
            const isAuth = item.sourceType === 'GOOGLE_DOC' || item.sourceUrl?.includes('docs.google.com');

            return (
              <Paper
                key={item.chunkId || idx}
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  borderColor: '#e2e8f0',
                  bgcolor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {/* Chunk Card Header */}
                <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`Evidence #${idx + 1}`}
                        size="small"
                        color="primary"
                        sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={`${Math.round((item.relevanceScore || 0.85) * 100)}% Match`}
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: (item.relevanceScore || 0.85) > 0.6 ? '#dcfce7' : '#fef9c3',
                          color: (item.relevanceScore || 0.85) > 0.6 ? '#15803d' : '#854d0e',
                        }}
                      />
                      {isAuth && (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: '12px !important' }} />}
                          label="Google Auth"
                          size="small"
                          sx={{ height: 22, fontSize: '0.68rem', bgcolor: '#e0f2fe', color: '#0369a1' }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                      {item.chunkId}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                    {item.documentName}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.8 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      ERP: <strong>{item.erp || 'General'}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Section: <strong>{item.section || 'General'}</strong>
                    </Typography>
                    {item.heading && item.heading !== item.section && (
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Heading: <strong>{item.heading}</strong>
                      </Typography>
                    )}
                    {item.page && (
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Page: <strong>{item.page}</strong>
                      </Typography>
                    )}
                  </Box>

                  {/* Provenance Lineage (§25) */}
                  {item.provenanceChain && item.provenanceChain.length > 0 && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.2,
                        borderRadius: 1.5,
                        bgcolor: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LinkIcon sx={{ fontSize: 13 }} /> Link Traversal Lineage (§25):
                      </Typography>
                      <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        {item.provenanceChain.map((node, nIdx) => (
                          <Typography
                            key={nIdx}
                            variant="caption"
                            sx={{
                              color: nIdx === item.provenanceChain.length - 1 ? '#2563eb' : '#64748b',
                              fontSize: '0.72rem',
                              fontWeight: nIdx === item.provenanceChain.length - 1 ? 700 : 500,
                              pl: nIdx * 1.5,
                            }}
                          >
                            {nIdx > 0 ? '↳ ' : '● '} {node.documentName || node.sourceUrl || 'Source'}
                            {node.section ? ` > §${node.section}` : ''}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Raw Content Collapsible */}
                <Accordion
                  expanded={expandedChunkId === item.chunkId}
                  onChange={handleAccordionChange(item.chunkId)}
                  elevation={0}
                  sx={{
                    borderTop: '1px solid #f1f5f9',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563eb' }}>
                      {expandedChunkId === item.chunkId ? 'Hide Raw Text' : 'Inspect Raw Chunk Text'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: '#0f172a',
                        color: '#f8fafc',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.76rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 280,
                        overflowY: 'auto',
                      }}
                    >
                      {item.contentSnippet}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            );
          })
        )}
      </Box>
    </Drawer>
  );
}
