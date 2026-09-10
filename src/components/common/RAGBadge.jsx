import React, { useState } from 'react';
import { Box, Chip, Tooltip, Typography, Popover, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function RAGBadge({ status = 'GREEN', drivers = [], size = 'medium', clickable = true }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    if (clickable) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const config = {
    GREEN: {
      label: 'On Track',
      color: '#10b981',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      icon: <CheckCircleOutlineIcon sx={{ fontSize: size === 'small' ? 14 : 16, color: '#059669' }} />,
    },
    AMBER: {
      label: 'At Risk',
      color: '#f59e0b',
      bg: '#fffbeb',
      border: '#fde68a',
      icon: <WarningAmberIcon sx={{ fontSize: size === 'small' ? 14 : 16, color: '#d97706' }} />,
    },
    RED: {
      label: 'Critical / Delayed',
      color: '#ef4444',
      bg: '#fef2f2',
      border: '#fecaca',
      icon: <ErrorOutlineIcon sx={{ fontSize: size === 'small' ? 14 : 16, color: '#dc2626' }} />,
    },
  }[status] || {
    label: status,
    color: '#64748b',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    icon: <InfoOutlinedIcon sx={{ fontSize: 16 }} />,
  };

  return (
    <>
      <Tooltip title={drivers.length > 0 ? "Click to view explainable risk drivers" : ""}>
        <Chip
          icon={config.icon}
          label={config.label}
          size={size}
          onClick={handleClick}
          sx={{
            backgroundColor: config.bg,
            color: config.color,
            border: `1px solid ${config.border}`,
            fontWeight: 700,
            cursor: clickable ? 'pointer' : 'default',
            fontSize: size === 'small' ? '0.72rem' : '0.8rem',
            '&:hover': clickable ? { opacity: 0.9, transform: 'scale(1.02)' } : {},
            transition: 'all 0.15s ease-in-out',
          }}
        />
      </Tooltip>

      {/* Popover explaining the exact deterministic risk drivers */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 2,
            maxWidth: 380,
            borderRadius: 2,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: `1px solid ${config.border}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          {config.icon}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: config.color }}>
            Delivery RAG: {config.label}
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}>
          DETERMINISTIC RISK DRIVERS (PRD §17):
        </Typography>

        {drivers && drivers.length > 0 ? (
          <List dense sx={{ p: 0 }}>
            {drivers.map((driver, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 20, mt: 0.4 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: config.color,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontSize: '0.825rem', color: 'text.primary', lineHeight: 1.4 }}>
                      {driver}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No specific risk drivers flagged. Project capacity and schedule are aligned.
          </Typography>
        )}
      </Popover>
    </>
  );
}
