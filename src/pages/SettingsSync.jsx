import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import StorageIcon from '@mui/icons-material/Storage';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ScienceIcon from '@mui/icons-material/Science';
import LinkIcon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { useApp } from '../data/store';
import { SyncService } from '../services/SyncService';
import MockJiraSimulatorModal from '../components/common/MockJiraSimulatorModal';
import { globalKnowledgeStore } from '../knowledge/KnowledgeStore';
import { globalIngestionPipeline } from '../knowledge/IngestionPipeline';
import { seedKnowledgeCorpus, PLAYBOOK_FIXTURES } from '../knowledge/SeedKnowledge';
import { EvalRunner } from '../knowledge/evaluation/EvalRunner';

export default function SettingsSync() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  // Knowledge Base State (Part 2: statement2 §28, §29)
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgressText, setIngestProgressText] = useState('');
  const [lastIngestSummary, setLastIngestSummary] = useState(null);
  const [selectedPlaybookFixture, setSelectedPlaybookFixture] = useState('doc-sap-playbook');
  const [customPlaybookTitle, setCustomPlaybookTitle] = useState('');
  const [customPlaybookErp, setCustomPlaybookErp] = useState('SAP S/4HANA');
  const [customPlaybookContent, setCustomPlaybookContent] = useState('');

  // URL inspection dialog
  const [inspectUrlDoc, setInspectUrlDoc] = useState(null);

  // RAG Evaluation State (§38)
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [evalReport, setEvalReport] = useState(null);
  const [isEvalDialogOpen, setIsEvalDialogOpen] = useState(false);

  // Jira Sync State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await SyncService.executeBidirectionalSync(dispatch, state.tasks);
    setIsManualSyncing(false);
  };

  // ERP Master Data State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingErp, setEditingErp] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newErp, setNewErp] = useState({
    name: '',
    category: 'Cloud Enterprise',
    classification: 'Standard',
    baseEffortDays: 15,
    defaultDeltaDays: 5,
    status: 'Active',
    description: '',
  });

  const handleOpenEdit = (erp) => {
    setEditingErp({ ...erp });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingErp) return;

    dispatch({
      type: 'UPDATE_ERP',
      payload: {
        id: editingErp.id,
        updates: {
          name: editingErp.name,
          category: editingErp.category,
          classification: editingErp.classification,
          baseEffortDays: Number(editingErp.baseEffortDays),
          defaultDeltaDays: Number(editingErp.defaultDeltaDays),
          status: editingErp.status,
          description: editingErp.description,
        },
      },
    });

    setIsEditOpen(false);
  };

  const handleCreateErp = () => {
    if (!newErp.name) return;

    const created = {
      ...newErp,
      id: `erp-${Date.now()}`,
      baseEffortDays: Number(newErp.baseEffortDays),
      defaultDeltaDays: Number(newErp.defaultDeltaDays),
    };

    dispatch({ type: 'CREATE_ERP', payload: created });
    setIsAddOpen(false);
  };

  // Knowledge Base Handlers (Part 2: statement2 §28, §29)
  const handleExecuteIngest = async () => {
    setIsIngesting(true);
    setIngestProgressText('Initializing ingestion pipeline...');
    try {
      let docTitle = '';
      let docContent = '';
      let erpName = customPlaybookErp;
      let docId = `doc-${Date.now()}`;
      let srcUrl = '';

      if (selectedPlaybookFixture === 'custom') {
        docTitle = customPlaybookTitle || 'Custom Ingested Playbook';
        docContent = customPlaybookContent || '# Custom ERP Playbook\n\nPrerequisites and integration specifications.';
        erpName = customPlaybookErp;
        srcUrl = 'mock://playbooks/custom-playbook.md';
      } else {
        const fixture = PLAYBOOK_FIXTURES.find((f) => f.documentId === selectedPlaybookFixture);
        if (fixture) {
          docId = fixture.documentId;
          docTitle = fixture.documentName;
          erpName = fixture.erp;
          srcUrl = fixture.sourceUrl;
          const res = await fetch(fixture.fetchUrl);
          docContent = await res.text();
        }
      }

      if (!docTitle || !docContent) {
        alert('Please provide a document title and content for ingestion.');
        setIsIngesting(false);
        return;
      }

      const summary = await globalIngestionPipeline.ingestPlaybook(
        {
          documentId: docId,
          documentName: docTitle,
          erp: erpName,
          sourceType: 'PLAYBOOK',
          sourceUrl: srcUrl,
          content: docContent,
        },
        {},
        ({ stage, detail }) => {
          setIngestProgressText(`${stage}: ${detail}`);
        }
      );

      setLastIngestSummary(summary);
      dispatch({
        type: 'SET_KNOWLEDGE_DOCUMENTS',
        payload: {
          documents: globalKnowledgeStore.listDocuments(),
          chunksCount: globalKnowledgeStore.chunks.length,
        },
      });
      setIsIngestModalOpen(false);
    } catch (err) {
      console.error('Ingestion failed:', err);
      alert(`Ingestion failed: ${err.message}`);
    } finally {
      setIsIngesting(false);
      setIngestProgressText('');
    }
  };

  const handleReindexDocument = async (doc) => {
    setIsIngesting(true);
    setIngestProgressText(`Re-indexing document ${doc.documentName}...`);
    try {
      const fixture = PLAYBOOK_FIXTURES.find((f) => f.documentId === doc.documentId || f.erp === doc.erp);
      if (fixture) {
        const res = await fetch(fixture.fetchUrl);
        const content = await res.text();
        const summary = await globalIngestionPipeline.ingestPlaybook({
          ...doc,
          content,
        });
        setLastIngestSummary(summary);
      }
      dispatch({
        type: 'SET_KNOWLEDGE_DOCUMENTS',
        payload: {
          documents: globalKnowledgeStore.listDocuments(),
          chunksCount: globalKnowledgeStore.chunks.length,
        },
      });
    } catch (err) {
      console.error('Re-index failed:', err);
    } finally {
      setIsIngesting(false);
      setIngestProgressText('');
    }
  };

  const handleDeleteDocument = (docId) => {
    globalKnowledgeStore.deleteDocument(docId);
    dispatch({
      type: 'SET_KNOWLEDGE_DOCUMENTS',
      payload: {
        documents: globalKnowledgeStore.listDocuments(),
        chunksCount: globalKnowledgeStore.chunks.length,
      },
    });
  };

  const handleResetKnowledgeCorpus = async () => {
    setIsIngesting(true);
    setIngestProgressText('Resetting and re-seeding all ERP playbooks...');
    await seedKnowledgeCorpus(true);
    dispatch({
      type: 'SET_KNOWLEDGE_DOCUMENTS',
      payload: {
        documents: globalKnowledgeStore.listDocuments(),
        chunksCount: globalKnowledgeStore.chunks.length,
      },
    });
    setIsIngesting(false);
    setIngestProgressText('');
  };

  const handleRunEvalSuite = async () => {
    setIsRunningEval(true);
    setIsEvalDialogOpen(true);
    try {
      const report = await EvalRunner.runAll();
      setEvalReport(report);
    } catch (err) {
      console.error('Eval runner error:', err);
    } finally {
      setIsRunningEval(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Settings & Integrations
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Unified management for bidirectional Jira synchronization, ERP catalogs, and the ERP Knowledge Base RAG pipeline.
          </Typography>
        </Box>

        {activeTab === 0 && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() => setIsSimulatorOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              Simulate Inbound Webhook
            </Button>
            <Button
              variant="contained"
              startIcon={<SyncIcon sx={isManualSyncing ? { animation: 'spin 1s linear infinite' } : {}} />}
              onClick={handleManualSync}
              disabled={isManualSyncing}
              sx={{ fontWeight: 700 }}
            >
              {isManualSyncing ? 'Synchronizing...' : 'Run Bidirectional Sync'}
            </Button>
          </Box>
        )}

        {activeTab === 1 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            Add ERP System
          </Button>
        )}

        {activeTab === 2 && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={handleResetKnowledgeCorpus}
              disabled={isIngesting}
              sx={{ fontWeight: 700, fontSize: '0.8rem' }}
            >
              Reset / Re-Seed Corpus
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScienceIcon />}
              onClick={handleRunEvalSuite}
              disabled={isRunningEval || isIngesting}
              sx={{ fontWeight: 700, fontSize: '0.8rem' }}
            >
              {isRunningEval ? 'Running Suite...' : 'Run RAG Eval Suite'}
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setIsIngestModalOpen(true)}
              disabled={isIngesting}
              sx={{ fontWeight: 700, fontSize: '0.8rem' }}
            >
              Upload & Ingest Playbook
            </Button>
          </Box>
        )}
      </Box>

      {/* Tabs Navigation */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ minHeight: 48 }}
        >
          <Tab
            icon={<SyncIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Jira Integration & Sync Engine"
            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 48 }}
          />
          <Tab
            icon={<StorageIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="ERP Master Data & Baseline Catalog"
            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 48 }}
          />
          <Tab
            icon={<PsychologyIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`ERP Knowledge Base (${state.knowledgeDocuments?.length || 0})`}
            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 48 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: Jira Integration */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Sync Status Cards */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f0fdf4', color: '#16a34a' }}>
                  <CloudDoneIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    CONNECTION STATUS
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#166534">
                    Active & Synced
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mock Jira Adapter (Latency ~400ms)
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#eff6ff', color: '#2563eb' }}>
                  <StorageIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    TOTAL LINKED ISSUES
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#1e40af">
                    {state.tasks.length} Jira Issues
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across {state.projects.length} ERP Delivery Projects
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fef3c7', color: '#d97706' }}>
                  <SyncIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    LAST SYNCHRONIZATION
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#92400e">
                    {state.jiraSyncStatus.lastSyncTime}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Zero sync conflicts detected
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* PRD Section 14: Field Ownership Matrix */}
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              System-of-Record Data Ownership Policy (PRD §14)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              To prevent data duplication and synchronization loops, every field has a defined master system.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip label="Control Tower Owned" color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Delivery Planning Layer</Typography>
                  </Box>
                  <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.825rem', color: 'text.primary' }}>
                    <li>Customer accounts & contractual commitments</li>
                    <li>Planned ERP integration window (Start / Completion)</li>
                    <li>Standard effort & non-standard effort deltas (X + ΔX)</li>
                    <li>Developer weekly capacity & resource allocations</li>
                    <li>Delivery RAG & forward-looking risk status</li>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip label="Jira Owned" color="info" size="small" sx={{ fontWeight: 700 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Task Execution Layer</Typography>
                  </Box>
                  <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.825rem', color: 'text.primary' }}>
                    <li>Jira issue keys & summaries (e.g. MER-101, APX-201)</li>
                    <li>Task execution statuses (To Do, In Progress, In Review, Done)</li>
                    <li>Individual developer work logs & time spent</li>
                    <li>Detailed technical sprint backlog items</li>
                    <li>Pull request / commit linkages</li>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Linked Jira Tasks Table */}
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Linked Jira Issues & Current State ({state.tasks.length})
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 110 }}>Jira Issue</TableCell>
                    <TableCell>Summary</TableCell>
                    <TableCell sx={{ width: 180 }}>Project</TableCell>
                    <TableCell sx={{ width: 140 }}>Assignee</TableCell>
                    <TableCell sx={{ width: 120 }}>Jira Status</TableCell>
                    <TableCell sx={{ width: 120 }}>Est. / Rem.</TableCell>
                    <TableCell sx={{ width: 120 }}>Sync State</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.tasks.map((task) => {
                    const proj = state.projects.find((p) => p.id === task.projectId);
                    const dev = state.developers.find((d) => d.id === task.developerId);

                    return (
                      <TableRow key={task.id} hover>
                        <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#1d4ed8' }}>
                          {task.jiraIssueKey}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {proj?.name.slice(0, 24)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {dev?.name || 'Unassigned'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              bgcolor:
                                task.status === 'Done'
                                  ? '#dcfce7'
                                  : task.status === 'In Progress'
                                  ? '#dbeafe'
                                  : '#f1f5f9',
                              color:
                                task.status === 'Done'
                                  ? '#15803d'
                                  : task.status === 'In Progress'
                                  ? '#1d4ed8'
                                  : '#475569',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                          {task.estimatedHours}h / <strong>{task.remainingHours}h</strong>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                              Mirrored
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Simulator Modal */}
          <MockJiraSimulatorModal open={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />
        </Box>
      )}

      {/* TAB 1: ERP Master Data */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Info Notice */}
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <strong>PRD Section 26 Principle:</strong> Effort assumptions defined here act as the default sizing model when Sales or Consulting creates an integration project. Any adjustments trigger an automated audit log entry.
          </Alert>

          {/* ERP Catalog Table */}
          <Paper sx={{ overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ERP System Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Classification</TableCell>
                    <TableCell align="right">Standard Baseline (X)</TableCell>
                    <TableCell align="right">Default Delta (ΔX)</TableCell>
                    <TableCell align="right">Typical Total</TableCell>
                    <TableCell>Integration Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.erps.map((erp) => {
                    const total = erp.baseEffortDays + (erp.defaultDeltaDays || 0);

                    return (
                      <TableRow key={erp.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {erp.name}
                        </TableCell>
                        <TableCell>
                          <Chip label={erp.category} size="small" sx={{ fontSize: '0.72rem' }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={erp.classification}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              bgcolor: erp.classification === 'Non-Standard' ? '#fff7ed' : '#eff6ff',
                              color: erp.classification === 'Non-Standard' ? '#c2410c' : '#1d4ed8',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                          {erp.baseEffortDays} days
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace', color: '#c2410c' }}>
                          +{erp.defaultDeltaDays || 0} days
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#1e40af' }}>
                          {total} days
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', maxWidth: 280 }}>
                          {erp.description}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={erp.status}
                            size="small"
                            color={erp.status === 'Active' ? 'success' : 'default'}
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenEdit(erp)} color="primary">
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Edit ERP Modal */}
          {editingErp && (
            <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ fontWeight: 800 }}>Edit ERP Effort Assumptions ({editingErp.name})</DialogTitle>
              <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="ERP Name"
                    fullWidth
                    size="small"
                    value={editingErp.name}
                    onChange={(e) => setEditingErp({ ...editingErp, name: e.target.value })}
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel>Classification</InputLabel>
                    <Select
                      value={editingErp.classification}
                      label="Classification"
                      onChange={(e) => setEditingErp({ ...editingErp, classification: e.target.value })}
                    >
                      <MenuItem value="Standard">Standard (Known baseline)</MenuItem>
                      <MenuItem value="Non-Standard">Non-Standard (Specialized Delta)</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Standard Baseline Effort (Days)"
                    type="number"
                    size="small"
                    fullWidth
                    value={editingErp.baseEffortDays}
                    onChange={(e) => setEditingErp({ ...editingErp, baseEffortDays: e.target.value })}
                    helperText="Baseline standard integration days (X)"
                  />

                  <TextField
                    label="Default Non-Standard Delta (Days)"
                    type="number"
                    size="small"
                    fullWidth
                    value={editingErp.defaultDeltaDays}
                    onChange={(e) => setEditingErp({ ...editingErp, defaultDeltaDays: e.target.value })}
                    helperText="Expected internal development delta (ΔX)"
                  />

                  <TextField
                    label="Integration Description"
                    multiline
                    rows={2}
                    size="small"
                    fullWidth
                    value={editingErp.description}
                    onChange={(e) => setEditingErp({ ...editingErp, description: e.target.value })}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveEdit}>
                  Save & Audit Change
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Add New ERP Modal */}
          <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800 }}>Register New ERP System Profile</DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="ERP System Name"
                  fullWidth
                  size="small"
                  required
                  value={newErp.name}
                  onChange={(e) => setNewErp({ ...newErp, name: e.target.value })}
                  placeholder="e.g. Workday Financial Management"
                />

                <TextField
                  label="Category"
                  fullWidth
                  size="small"
                  value={newErp.category}
                  onChange={(e) => setNewErp({ ...newErp, category: e.target.value })}
                  placeholder="e.g. Cloud HCM / Finance"
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Classification</InputLabel>
                  <Select
                    value={newErp.classification}
                    label="Classification"
                    onChange={(e) => setNewErp({ ...newErp, classification: e.target.value })}
                  >
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Non-Standard">Non-Standard</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Base Effort (Days)"
                  type="number"
                  size="small"
                  fullWidth
                  value={newErp.baseEffortDays}
                  onChange={(e) => setNewErp({ ...newErp, baseEffortDays: e.target.value })}
                />

                <TextField
                  label="Default Delta (Days)"
                  type="number"
                  size="small"
                  fullWidth
                  value={newErp.defaultDeltaDays}
                  onChange={(e) => setNewErp({ ...newErp, defaultDeltaDays: e.target.value })}
                />

                <TextField
                  label="Technical Description"
                  multiline
                  rows={2}
                  size="small"
                  fullWidth
                  value={newErp.description}
                  onChange={(e) => setNewErp({ ...newErp, description: e.target.value })}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreateErp} disabled={!newErp.name}>
                Add ERP Catalog Entry
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* TAB 2: ERP Knowledge Base & Ingestion Pipeline (§28, §29) */}
      {activeTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Ingestion In-Progress Banner */}
          {isIngesting && (
            <Paper sx={{ p: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <PsychologyIcon sx={{ color: '#2563eb', animation: 'spin 2s linear infinite' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e40af' }}>
                  Ingestion Pipeline in Progress
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#1e3a8a', mb: 1.5, fontSize: '0.82rem' }}>
                {ingestProgressText || 'Validating document, extracting URLs, and indexing chunks...'}
              </Typography>
              <LinearProgress sx={{ borderRadius: 1 }} />
            </Paper>
          )}

          {/* Last Ingestion Run Stage Breakdown (§29) */}
          {lastIngestSummary && (
            <Paper
              sx={{
                p: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 2.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Pipeline Run Completed: {lastIngestSummary.documentName}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setLastIngestSummary(null)} sx={{ fontSize: '0.72rem' }}>
                  Dismiss
                </Button>
              </Box>

              {/* Stage Flow Visualization (§29) */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.2 }}>
                <Chip
                  label="1. Document Validated"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                />
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>→</Typography>
                <Chip
                  label={`2. ${lastIngestSummary.textChunksCount} Chunks Created`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                />
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>→</Typography>
                <Chip
                  label={`3. ${lastIngestSummary.urlsDiscovered} URLs Discovered`}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#f1f5f9' }}
                />
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>→</Typography>
                <Chip
                  label={`4. ${lastIngestSummary.relevantUrlsCount} Relevant Tech URLs`}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#f1f5f9' }}
                />
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>→</Typography>
                <Chip
                  label={`5. ${lastIngestSummary.successfullyFetchedCount} Successfully Fetched & Indexed`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                />
                {lastIngestSummary.authRequiredCount > 0 && (
                  <>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>→</Typography>
                    <Chip
                      icon={<LockIcon sx={{ fontSize: '12px !important' }} />}
                      label={`6. ${lastIngestSummary.authRequiredCount} Require Auth (Preserved)`}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#fef3c7', color: '#b45309' }}
                    />
                  </>
                )}
              </Box>
            </Paper>
          )}

          {/* Metric Cards */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  TOTAL DOCUMENTS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: '#0f172a' }}>
                  {state.knowledgeDocuments?.length || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Approved playbooks & linked guides
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  INDEXED CHUNKS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: '#2563eb' }}>
                  {state.knowledgeChunksCount || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  TF-IDF vectorized chunks in memory
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  SUPPORTED ERPS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: '#10b981' }}>
                  {new Set(state.knowledgeDocuments?.map((d) => d.erp) || []).size}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  SAP, Oracle, Dynamics 365
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  RAG RETRIEVAL ENGINE
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, my: 0.8, color: '#16a34a' }}>
                  Active (Grounded)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Deterministic & strict no-hallucination
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Documents Table (§28) */}
          <Paper sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Ingested Technical Documents & Playbooks ({state.knowledgeDocuments?.length || 0})
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Authoritative sources indexed for developer question-answering with link traversal lineage.
                </Typography>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Document Name</TableCell>
                    <TableCell sx={{ width: 150 }}>ERP Platform</TableCell>
                    <TableCell sx={{ width: 140 }}>Source Type</TableCell>
                    <TableCell sx={{ width: 80 }}>Version</TableCell>
                    <TableCell sx={{ width: 110 }}>Status</TableCell>
                    <TableCell sx={{ width: 130 }}>Discovered URLs</TableCell>
                    <TableCell sx={{ width: 120 }}>Indexed At</TableCell>
                    <TableCell align="right" sx={{ width: 160 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.knowledgeDocuments?.map((doc) => {
                    const isGoogleAuth = doc.sourceType === 'GOOGLE_DOC' || doc.requiresAuth;
                    const urlCount = doc.discoveredUrls?.length || 0;

                    return (
                      <TableRow key={doc.documentId} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {doc.documentName}
                          </Typography>
                          {doc.parentSourceUrl && (
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                              Linked from: <em>{doc.parentSourceUrl}</em>
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doc.erp}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.72rem', height: 22, fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isGoogleAuth ? 'Google Doc' : doc.sourceType || 'DOCUMENT'}
                            size="small"
                            icon={isGoogleAuth ? <LockIcon sx={{ fontSize: '12px !important' }} /> : undefined}
                            sx={{
                              fontSize: '0.7rem',
                              height: 22,
                              fontWeight: 600,
                              bgcolor: isGoogleAuth ? '#e0f2fe' : '#f1f5f9',
                              color: isGoogleAuth ? '#0369a1' : '#334155',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                          v{doc.version || '1.0'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doc.status}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: doc.status === 'INDEXED' ? '#dcfce7' : '#fef3c7',
                              color: doc.status === 'INDEXED' ? '#15803d' : '#b45309',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {urlCount > 0 ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<LinkIcon sx={{ fontSize: '13px !important' }} />}
                              onClick={() => setInspectUrlDoc(doc)}
                              sx={{
                                fontSize: '0.68rem',
                                py: 0.2,
                                height: 22,
                                textTransform: 'none',
                                borderRadius: 1.5,
                              }}
                            >
                              {urlCount} URLs
                            </Button>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              None
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {doc.indexedAt ? new Date(doc.indexedAt).toLocaleDateString() : 'Active'}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Re-index document">
                              <IconButton
                                size="small"
                                onClick={() => handleReindexDocument(doc)}
                                sx={{ color: '#2563eb' }}
                              >
                                <RefreshIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete from knowledge index">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDocument(doc.documentId)}
                                sx={{ color: '#ef4444' }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Ingest Playbook Modal Dialog (§29) */}
          <Dialog open={isIngestModalOpen} onClose={() => setIsIngestModalOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800 }}>Upload & Ingest Playbook into Knowledge RAG</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                The ingestion pipeline extracts text, automatically discovers embedded technical documentation URLs, fetches linked web guides, handles Google Workspace auth, chunks the content, and indexes it into the ERP Developer Brain.
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>Select Playbook Source</InputLabel>
                <Select
                  value={selectedPlaybookFixture}
                  label="Select Playbook Source"
                  onChange={(e) => setSelectedPlaybookFixture(e.target.value)}
                >
                  <MenuItem value="doc-sap-playbook">
                    SAP S/4HANA Playbook v4.2 (Contains 1 Public URL + 2 Google Auth URLs)
                  </MenuItem>
                  <MenuItem value="doc-oracle-playbook">
                    Oracle NetSuite Playbook v3.0 (Contains 1 Public Troubleshooting URL)
                  </MenuItem>
                  <MenuItem value="doc-dynamics-playbook">
                    Microsoft Dynamics 365 Playbook v2.5 (Contains 1 Public Azure Bus URL)
                  </MenuItem>
                  <MenuItem value="custom">Custom Playbook Markdown (Upload or Type)</MenuItem>
                </Select>
              </FormControl>

              {selectedPlaybookFixture === 'custom' && (
                <>
                  <TextField
                    label="Document Title"
                    size="small"
                    fullWidth
                    value={customPlaybookTitle}
                    onChange={(e) => setCustomPlaybookTitle(e.target.value)}
                    placeholder="e.g. Workday HCM Financial Integration Guide"
                  />
                  <FormControl fullWidth size="small">
                    <InputLabel>Target ERP System</InputLabel>
                    <Select
                      value={customPlaybookErp}
                      label="Target ERP System"
                      onChange={(e) => setCustomPlaybookErp(e.target.value)}
                    >
                      {state.erps.map((e) => (
                        <MenuItem key={e.id} value={e.name}>
                          {e.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Playbook Markdown Content (with URLs)"
                    multiline
                    rows={6}
                    size="small"
                    fullWidth
                    value={customPlaybookContent}
                    onChange={(e) => setCustomPlaybookContent(e.target.value)}
                    placeholder="# Playbook Title&#10;&#10;Technical specs... [Linked Guide](https://...)"
                  />
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setIsIngestModalOpen(false)} color="inherit">
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleExecuteIngest}
                disabled={isIngesting}
                startIcon={<CloudUploadIcon />}
              >
                {isIngesting ? 'Ingesting...' : 'Run Ingestion Pipeline'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Discovered URLs Inspection Dialog (§28, §30) */}
          <Dialog open={!!inspectUrlDoc} onClose={() => setInspectUrlDoc(null)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon sx={{ color: '#2563eb' }} />
                Discovered Technical URLs: {inspectUrlDoc?.documentName}
              </Box>
              <IconButton onClick={() => setInspectUrlDoc(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.82rem' }}>
                URLs discovered inside the primary playbook. The ingestion pipeline classifies each URL, determines technical relevance, and fetches/indexes content through public or authenticated fetchers.
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>URL & Title</TableCell>
                      <TableCell sx={{ width: 140 }}>Status</TableCell>
                      <TableCell sx={{ width: 180 }}>Auth Provider</TableCell>
                      <TableCell sx={{ width: 90 }}>Chunks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inspectUrlDoc?.discoveredUrls?.map((u, uIdx) => (
                      <TableRow key={uIdx} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                            {u.label || u.documentName || 'Linked Documentation'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#2563eb' }}>
                            {u.url}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.status}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor:
                                u.status === 'INDEXED'
                                  ? '#dcfce7'
                                  : u.status === 'AUTH_REQUIRED'
                                  ? '#fef3c7'
                                  : '#fee2e2',
                              color:
                                u.status === 'INDEXED'
                                  ? '#15803d'
                                  : u.status === 'AUTH_REQUIRED'
                                  ? '#b45309'
                                  : '#b91c1c',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: '#475569' }}>
                            {u.requiresAuth ? (u.authProvider || 'Mock Google Workspace Provider') : 'Public Web'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                          {u.chunksCount || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setInspectUrlDoc(null)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* RAG Evaluation Benchmark Suite Dialog (§38) */}
          <Dialog open={isEvalDialogOpen} onClose={() => setIsEvalDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon sx={{ color: '#2563eb' }} />
                RAG Evaluation Benchmark Suite Report (§38)
              </Box>
              <IconButton onClick={() => setIsEvalDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 2.5 }}>
              {isRunningEval ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <CircularProgress size={36} sx={{ color: '#2563eb', mb: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Evaluating RAG Retrieval Accuracy & Groundedness...
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Testing standard retrieval, linked URL resolution, Google-authenticated docs, and no-answer compliance.
                  </Typography>
                </Box>
              ) : evalReport ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Score Banner */}
                  <Paper
                    sx={{
                      p: 2.5,
                      bgcolor: evalReport.accuracyPct >= 80 ? '#f0fdf4' : '#fef2f2',
                      border: '1px solid',
                      borderColor: evalReport.accuracyPct >= 80 ? '#bbf7d0' : '#fecaca',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: evalReport.accuracyPct >= 80 ? '#15803d' : '#b91c1c' }}>
                          {evalReport.accuracyPct}%
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1f2937' }}>
                          Benchmark Accuracy Score ({evalReport.passedCount} / {evalReport.totalTests} tests passed)
                        </Typography>
                      </Box>
                      <Chip
                        label={evalReport.accuracyPct === 100 ? 'EXCELLENT' : 'PASSED'}
                        color={evalReport.accuracyPct >= 80 ? 'success' : 'error'}
                        sx={{ fontWeight: 800, fontSize: '0.8rem', height: 28 }}
                      />
                    </Box>
                  </Paper>

                  {/* Test Cases Table */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: 80 }}>Result</TableCell>
                          <TableCell>Test Question</TableCell>
                          <TableCell sx={{ width: 140 }}>Target ERP</TableCell>
                          <TableCell sx={{ width: 150 }}>Test Category</TableCell>
                          <TableCell sx={{ width: 80 }}>Latency</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {evalReport.results.map((r) => (
                          <TableRow key={r.id} hover>
                            <TableCell>
                              <Chip
                                label={r.passed ? 'PASS' : 'FAIL'}
                                size="small"
                                color={r.passed ? 'success' : 'error'}
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                {r.question}
                              </Typography>
                              {r.failures?.length > 0 && (
                                <Typography variant="caption" sx={{ color: '#b91c1c', display: 'block', mt: 0.3 }}>
                                  ⚠️ {r.failures.join(' | ')}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip label={r.erp} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {r.type}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {r.executionTimeMs}ms
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Typography variant="body2">No evaluation executed yet.</Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setIsEvalDialogOpen(false)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}
