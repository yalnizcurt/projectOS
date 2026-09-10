import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        my: 1.5,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #334155',
        bgcolor: '#0f172a',
      }}
    >
      {/* Header with language and copy button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1.5,
          py: 0.5,
          bgcolor: '#1e293b',
          borderBottom: '1px solid #334155',
        }}
      >
        <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.72rem' }}>
          {language || 'code'}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
          <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? '#4ade80' : '#94a3b8', p: 0.25 }}>
            {copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Code contents */}
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.5,
          color: '#f8fafc',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          overflowX: 'auto',
        }}
      >
        <code>{value}</code>
      </Box>
    </Box>
  );
}

export default function MarkdownRenderer({ content, sx = {} }) {
  if (!content) return null;

  return (
    <Box
      sx={{
        fontSize: '0.86rem',
        lineHeight: 1.65,
        color: '#1e293b',
        '& > *:first-of-type': { mt: 0 },
        '& > *:last-child': { mb: 0 },
        ...sx,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', mt: 2, mb: 0.8 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                fontSize: '0.96rem',
                mt: 1.8,
                mb: 0.6,
                borderBottom: '1px solid #e2e8f0',
                pb: 0.4,
              }}
            >
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', mt: 1.5, mb: 0.4 }}>
              {children}
            </Typography>
          ),
          h4: ({ children }) => (
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem', mt: 1.2, mb: 0.3, display: 'block' }}>
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography variant="body2" sx={{ color: '#1e293b', lineHeight: 1.68, fontSize: '0.86rem', mb: 1.2 }}>
              {children}
            </Typography>
          ),
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 2.5, my: 0.8, color: '#1e293b' }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 2.5, my: 0.8, color: '#1e293b' }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Box component="li" sx={{ fontSize: '0.86rem', lineHeight: 1.6, mb: 0.4 }}>
              {children}
            </Box>
          ),
          strong: ({ children }) => (
            <Box component="strong" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {children}
            </Box>
          ),
          em: ({ children }) => (
            <Box component="em" sx={{ fontStyle: 'italic', color: '#334155' }}>
              {children}
            </Box>
          ),
          blockquote: ({ children }) => (
            <Box
              component="blockquote"
              sx={{
                borderLeft: '3px solid #3b82f6',
                bgcolor: '#f8fafc',
                pl: 1.5,
                py: 0.5,
                my: 1.2,
                borderRadius: '0 6px 6px 0',
                color: '#475569',
                fontStyle: 'italic',
                '& p': { mb: 0 },
              }}
            >
              {children}
            </Box>
          ),
          hr: () => <Box component="hr" sx={{ border: 'none', borderTop: '1px solid #e2e8f0', my: 2 }} />,
          table: ({ children }) => (
            <Box sx={{ overflowX: 'auto', my: 1.8, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                {children}
              </Box>
            </Box>
          ),
          thead: ({ children }) => (
            <Box component="thead" sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {children}
            </Box>
          ),
          tbody: ({ children }) => <Box component="tbody">{children}</Box>,
          tr: ({ children }) => (
            <Box
              component="tr"
              sx={{
                borderBottom: '1px solid #f1f5f9',
                '&:last-child': { borderBottom: 'none' },
                '&:nth-of-type(even)': { bgcolor: '#fafafa' },
              }}
            >
              {children}
            </Box>
          ),
          th: ({ children }) => (
            <Box component="th" sx={{ p: '8px 12px', fontWeight: 700, textAlign: 'left', color: '#334155' }}>
              {children}
            </Box>
          ),
          td: ({ children }) => (
            <Box component="td" sx={{ p: '8px 12px', color: '#1e293b' }}>
              {children}
            </Box>
          ),
          a: ({ href, children }) => (
            <Box
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#2563eb',
                textDecoration: 'underline',
                fontWeight: 600,
                '&:hover': { color: '#1d4ed8' },
              }}
            >
              {children}
            </Box>
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && (match || codeString.includes('\n'))) {
              return <CodeBlock language={match ? match[1] : ''} value={codeString} />;
            }

            return (
              <Box
                component="code"
                sx={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.82rem',
                  bgcolor: '#f1f5f9',
                  color: '#0f172a',
                  px: 0.6,
                  py: 0.2,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0',
                  wordBreak: 'break-word',
                }}
                {...props}
              >
                {children}
              </Box>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
