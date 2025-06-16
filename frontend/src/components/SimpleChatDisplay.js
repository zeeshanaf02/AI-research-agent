import React, { useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const SimpleChatDisplay = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {messages.map((message, index) => {
        if (message.role === 'user') {
          return (
            <Paper
              key={index}
              sx={{
                p: 2,
                bgcolor: '#7b68ee',
                color: 'white',
                borderRadius: '10px 10px 0 10px',
                alignSelf: 'flex-end',
                maxWidth: '75%',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                You
              </Typography>
              <Typography variant="body1">{message.content}</Typography>
            </Paper>
          );
        } else if (message.role === 'assistant') {
          return (
            <Paper
              key={index}
              sx={{
                p: 2,
                bgcolor: '#2d2d2d',
                color: 'white',
                borderRadius: '10px 10px 10px 0',
                alignSelf: 'flex-start',
                maxWidth: '75%',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#9370db' }}>
                Research Assistant
              </Typography>
              <Box sx={{ 
                '& a': { 
                  color: '#9370db', 
                  textDecoration: 'underline',
                  '&:hover': { opacity: 0.8 }
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  margin: '8px 0',
                  fontWeight: 'bold',
                  color: '#e0e0e0'
                },
                '& ul, & ol': {
                  paddingLeft: '20px',
                  marginBottom: '8px'
                },
                '& li': {
                  marginBottom: '4px'
                },
                '& p': {
                  marginBottom: '8px'
                },
                '& code': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                },
                '& strong': {
                  color: '#9370db',
                  fontWeight: 'bold'
                }
              }}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Paper>
          );
        } else if (message.role === 'system') {
          return (
            <Paper
              key={index}
              sx={{
                p: 2,
                bgcolor: 'rgba(0,0,0,0.3)',
                color: '#a0a0a0',
                borderRadius: '10px',
                alignSelf: 'center',
                maxWidth: '90%',
                border: '1px dashed #3d3d3d'
              }}
            >
              <Typography variant="body2">{message.content}</Typography>
            </Paper>
          );
        }
        return null;
      })}

      {isLoading && (
        <Paper
          sx={{
            p: 2,
            bgcolor: '#2d2d2d',
            color: 'white',
            borderRadius: '10px 10px 10px 0',
            alignSelf: 'flex-start',
            maxWidth: '75%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#9370db', mr: 1 }}>
            Thinking
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#9370db',
                animation: 'pulse 1s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.5 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.5 }
                }
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#9370db',
                animation: 'pulse 1s infinite 0.2s'
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#9370db',
                animation: 'pulse 1s infinite 0.4s'
              }}
            />
          </Box>
        </Paper>
      )}
      
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default SimpleChatDisplay;