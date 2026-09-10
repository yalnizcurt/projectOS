import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import HubIcon from '@mui/icons-material/Hub';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import CitationCard from './CitationCard';
import EvidenceDrawer from './EvidenceDrawer';
import MarkdownRenderer from './MarkdownRenderer';
import { globalRetrievalPipeline } from '../../knowledge/RetrievalPipeline';
import { useApp } from '../../data/store';

const SAMPLE_PROMPTS = [
  'What are the prerequisites before starting this ERP integration?',
  'What configuration is required for IDoc mapping and partner profiles?',
  'How do I troubleshoot SAP IDoc Status 51 error?',
  'What server settings and buffer allocation are required for production?',
];

export default function BrainChatPanel({ context = {}, isCompact = false }) {
  const { state, dispatch } = useApp();
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Evidence Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');

  // Feedback Dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState(null);
  const [feedbackReason, setFeedbackReason] = useState('Missing information');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.brainConversations, isLoading]);

  const handleSend = async (queryText = null) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setInputQuery('');
    setIsLoading(true);

    try {
      const activeDev = state.developers.find((d) => d.id === state.activeDeveloperId);

      const result = await globalRetrievalPipeline.query(q, {
        erp: context.erp,
        customer: context.customer,
        project: context.project,
        jiraTask: context.jiraTask,
        developer: activeDev,
        conversationHistory: state.brainConversations,
      });

      dispatch({
        type: 'ADD_BRAIN_MESSAGE',
        payload: result,
      });
    } catch (err) {
      console.error('Retrieval error:', err);
      dispatch({
        type: 'ADD_BRAIN_MESSAGE',
        payload: {
          id: `err-${Date.now()}`,
          timestamp: new Date().toISOString(),
          question: q,
          context,
          answer: `⚠️ **System Error:** Failed to execute knowledge retrieval (${err.message}).`,
          citations: [],
          evidence: [],
          noAnswer: true,
          modelUsed: 'System Error Handler',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEvidence = (msg) => {
    setSelectedEvidence(msg.evidence || []);
    setSelectedQuestion(msg.question || '');
    setDrawerOpen(true);
  };

  const handleThumbFeedback = (msgId, isUp) => {
    if (isUp) {
      dispatch({
        type: 'ADD_BRAIN_FEEDBACK',
        payload: {
          messageId: msgId,
          rating: 'HELPFUL',
          reason: 'Positive user rating',
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      setFeedbackMessageId(msgId);
      setFeedbackDialogOpen(true);
    }
  };

  const handleSubmitNegativeFeedback = () => {
    if (feedbackMessageId) {
      dispatch({
        type: 'ADD_BRAIN_FEEDBACK',
        payload: {
          messageId: feedbackMessageId,
          rating: 'NOT_HELPFUL',
          reason: feedbackReason,
          timestamp: new Date().toISOString(),
        },
      });
    }
    setFeedbackDialogOpen(false);
    setFeedbackMessageId(null);
  };

  const getFeedbackForMessage = (msgId) => {
    return state.brainFeedback.find((f) => f.messageId === msgId);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Action Header in Panel */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Technical Knowledge Query
          </Typography>
          <Chip
            label="Source Grounded"
            size="small"
            sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }}
          />
        </Box>

        {state.brainConversations.length > 0 && (
          <Button
            size="small"
            color="inherit"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={() => dispatch({ type: 'CLEAR_BRAIN_CONVERSATION' })}
            sx={{ fontSize: '0.72rem', textTransform: 'none' }}
          >
            Clear Conversation
          </Button>
        )}
      </Box>

      {/* Messages Feed */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          pr: 1,
          minHeight: isCompact ? 320 : 440,
          maxHeight: isCompact ? 480 : 640,
        }}
      >
        {state.brainConversations.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              py: 6,
              textAlign: 'center',
              bgcolor: '#f8fafc',
              borderRadius: 3,
              border: '1px dashed #cbd5e1',
              p: 3,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <PsychologyIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
              Ask ERP Developer Brain
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 440, mb: 3, fontSize: '0.85rem' }}>
              Query verified technical documentation, BAPI parameters, IDoc structures, and deployment guides grounded in approved playbooks.
            </Typography>

            {/* Prompt Suggestion Chips */}
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', mb: 1, textTransform: 'uppercase' }}>
              SUGGESTED TECHNICAL INQUIRIES
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 580 }}>
              {SAMPLE_PROMPTS.map((prompt, pIdx) => (
                <Chip
                  key={pIdx}
                  label={prompt}
                  onClick={() => handleSend(prompt)}
                  sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#eff6ff', borderColor: '#93c5fd', color: '#1d4ed8' },
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          state.brainConversations.map((msg) => {
            const feedback = getFeedbackForMessage(msg.id);

            return (
              <Box key={msg.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* User Prompt Bubble */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box
                    sx={{
                      maxWidth: '82%',
                      p: 1.8,
                      borderRadius: '16px 16px 4px 16px',
                      bgcolor: '#2563eb',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      {msg.question}
                    </Typography>
                    {msg.context?.contextSummary && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#bfdbfe', mt: 0.5, fontSize: '0.68rem' }}>
                        Context: {msg.context.contextSummary}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Grounded Assistant Answer Bubble */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      maxWidth: '92%',
                      p: 2.2,
                      borderRadius: '16px 16px 16px 4px',
                      bgcolor: msg.noAnswer ? '#fffbeb' : '#ffffff',
                      border: '1px solid',
                      borderColor: msg.noAnswer ? '#fef08a' : '#e2e8f0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Model & Latency Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: msg.noAnswer ? '#fef3c7' : '#eff6ff',
                            color: msg.noAnswer ? '#d97706' : '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {msg.noAnswer ? <WarningAmberIcon sx={{ fontSize: 14 }} /> : <PsychologyIcon sx={{ fontSize: 14 }} />}
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                          ERP Developer Brain
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                        {msg.executionTimeMs ? `${msg.executionTimeMs}ms` : ''} · {msg.modelUsed}
                      </Typography>
                    </Box>

                    {/* Answer Text Content with Rich Markdown & Code Highlighting */}
                    <MarkdownRenderer content={msg.answer} />

                    {/* Mandatory Citations Section (§22) */}
                    {msg.citations && msg.citations.length > 0 && (
                      <Box sx={{ mt: 2.5, pt: 1.8, borderTop: '1px solid #f1f5f9' }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1, letterSpacing: '0.04em' }}
                        >
                          VERIFIED SOURCE CITATIONS ({msg.citations.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {msg.citations.map((cite, cIdx) => (
                            <CitationCard key={cIdx} citation={cite} index={cIdx + 1} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Bottom Action Strip: Inspect Evidence & Feedback (§23, §37) */}
                    <Box
                      sx={{
                        mt: 2,
                        pt: 1.5,
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1,
                      }}
                    >
                      {msg.evidence && msg.evidence.length > 0 ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<HubIcon sx={{ fontSize: 15 }} />}
                          onClick={() => handleOpenEvidence(msg)}
                          sx={{
                            fontSize: '0.72rem',
                            textTransform: 'none',
                            py: 0.3,
                            borderRadius: 1.5,
                            borderColor: '#cbd5e1',
                            color: '#334155',
                            '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' },
                          }}
                        >
                          Inspect Evidence ({msg.evidence.length} Chunks)
                        </Button>
                      ) : (
                        <Box />
                      )}

                      {/* Feedback Thumb Icons (§37) */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', mr: 0.5 }}>
                          Helpful?
                        </Typography>
                        <Tooltip title="Helpful answer">
                          <IconButton
                            size="small"
                            onClick={() => handleThumbFeedback(msg.id, true)}
                            color={feedback?.rating === 'HELPFUL' ? 'primary' : 'default'}
                            sx={{ p: 0.4 }}
                          >
                            {feedback?.rating === 'HELPFUL' ? (
                              <ThumbUpIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Not helpful">
                          <IconButton
                            size="small"
                            onClick={() => handleThumbFeedback(msg.id, false)}
                            color={feedback?.rating === 'NOT_HELPFUL' ? 'error' : 'default'}
                            sx={{ p: 0.4 }}
                          >
                            {feedback?.rating === 'NOT_HELPFUL' ? (
                              <ThumbDownIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <ThumbDownOutlinedIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        {feedback && (
                          <Chip
                            label={feedback.rating === 'HELPFUL' ? 'Logged 👍' : `Logged (${feedback.reason})`}
                            size="small"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            );
          })
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px 16px 16px 4px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CircularProgress size={18} thickness={5} sx={{ color: '#2563eb' }} />
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                Retrieving approved playbooks, resolving linked URLs, and synthesizing grounded evidence...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Form Bar */}
      <Paper
        variant="outlined"
        sx={{
          p: 0.8,
          borderRadius: 3,
          borderColor: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={`Ask about ${context.erp || 'ERP'} configuration, prerequisites, IDoc mapping, troubleshooting...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isLoading}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: { px: 1.5, fontSize: '0.88rem' },
          }}
        />

        <Button
          variant="contained"
          size="medium"
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
          endIcon={<SendIcon sx={{ fontSize: 16 }} />}
        >
          Ask
        </Button>
      </Paper>

      {/* Evidence Inspection Drawer (§23) */}
      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        evidence={selectedEvidence}
        question={selectedQuestion}
      />

      {/* Negative Feedback Dialog (§37) */}
      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Feedback for Retrieval Quality</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Help us improve the ERP Developer Brain RAG index. What was the issue with this response?
          </Typography>
          <RadioGroup value={feedbackReason} onChange={(e) => setFeedbackReason(e.target.value)}>
            <FormControlLabel value="Incorrect answer" control={<Radio size="small" />} label="Incorrect answer" />
            <FormControlLabel value="Wrong source" control={<Radio size="small" />} label="Wrong source cited" />
            <FormControlLabel value="Missing information" control={<Radio size="small" />} label="Missing information" />
            <FormControlLabel value="Not relevant" control={<Radio size="small" />} label="Not relevant to my ERP" />
            <FormControlLabel value="Other" control={<Radio size="small" />} label="Other" />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFeedbackDialogOpen(false)} color="inherit" size="small">
            Cancel
          </Button>
          <Button onClick={handleSubmitNegativeFeedback} variant="contained" color="primary" size="small">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
