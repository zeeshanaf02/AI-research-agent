import React, { useRef, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const ChatMessages = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'auto',
        p: 2,
        gap: 2
      }}
    >
      {messages.map((message, index) => (
        <Box 
          key={index}
          sx={{
            maxWidth: message.role === 'system' ? '100%' : '75%',
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            ...(message.role === 'user' ? {
              alignSelf: 'flex-end',
              bgcolor: 'primary.main',
              color: 'white',
              ml: 'auto',
              borderBottomRightRadius: 0,
              boxShadow: '0 2px 10px rgba(123, 104, 238, 0.3)'
            } : message.role === 'system' ? {
              alignSelf: 'center',
              bgcolor: 'rgba(0,0,0,0.3)',
              color: 'text.secondary',
              mx: 'auto',
              fontSize: '0.9rem',
              border: '1px dashed #3d3d3d',
              px: 3,
              py: 1,
              maxWidth: '90%'
            } : {
              alignSelf: 'flex-start',
              bgcolor: 'background.paper',
              color: 'text.primary',
              mr: 'auto',
              borderBottomLeftRadius: 0,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            })
          }}
        >
          {message.role === 'user' && (
            <Typography 
              variant="caption" 
              sx={{ 
                alignSelf: 'flex-end', 
                mb: 1, 
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)'
              }}
            >
              You
            </Typography>
          )}
          
          {message.role === 'assistant' && (
            <Typography 
              variant="caption" 
              sx={{ 
                alignSelf: 'flex-start', 
                mb: 1, 
                fontWeight: 600,
                color: 'primary.main'
              }}
            >
              Research Assistant
            </Typography>
          )}
          
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              '& a': {
                color: message.role === 'user' ? 'white' : 'secondary.main',
                textDecoration: 'underline',
                '&:hover': {
                  opacity: 0.8
                }
              },
              '& code': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '2px 4px',
                borderRadius: 1,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.9em'
              }
            }}
          >
            {message.content}
          </Typography>
          
          <Typography 
            variant="caption" 
            color={message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'} 
            sx={{ 
              display: 'block', 
              textAlign: 'right', 
              mt: 1,
              fontSize: '0.75rem'
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      ))}
      
      {isLoading && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2,
            maxWidth: '75%',
            borderRadius: 2,
            bgcolor: 'background.paper',
            alignSelf: 'flex-start',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Typography variant="caption" sx={{ mr: 1, color: 'primary.main', fontWeight: 600 }}>
            Research Assistant is thinking
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: 'primary.main',
                animation: 'pulse 1.5s infinite ease-in-out',
                animationDelay: '0s',
                mr: 0.5,
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    opacity: 0.5
                  },
                  '50%': {
                    transform: 'scale(1.2)',
                    opacity: 1
                  }
                }
              }} 
            />
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: 'primary.main',
                animation: 'pulse 1.5s infinite ease-in-out',
                animationDelay: '0.3s',
                mr: 0.5
              }} 
            />
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: 'primary.main',
                animation: 'pulse 1.5s infinite ease-in-out',
                animationDelay: '0.6s'
              }} 
            />
          </Box>
        </Box>
      )}
      
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatMessages;