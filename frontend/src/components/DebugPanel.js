import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

const DebugPanel = ({ sessionId, uploadedFiles, chatHistory }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mt: 2,
        bgcolor: 'rgba(0,0,0,0.3)',
        borderRadius: 2,
        border: '1px dashed #ff5722',
        overflow: 'auto',
        maxHeight: '300px'
      }}
    >
      <Typography variant="h6" color="#ff5722" gutterBottom>
        Debug Information
      </Typography>
      
      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Typography variant="subtitle2" color="#ff5722">
        Session ID: {sessionId}
      </Typography>
      
      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Typography variant="subtitle2" color="#ff5722" gutterBottom>
        Uploaded Files ({uploadedFiles?.length || 0}):
      </Typography>
      
      {uploadedFiles && uploadedFiles.length > 0 ? (
        <Box component="pre" sx={{ 
          p: 1, 
          bgcolor: 'rgba(0,0,0,0.5)', 
          borderRadius: 1,
          fontSize: '0.75rem',
          overflow: 'auto',
          color: '#e0e0e0'
        }}>
          {JSON.stringify(uploadedFiles, null, 2)}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No files uploaded
        </Typography>
      )}
      
      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Typography variant="subtitle2" color="#ff5722" gutterBottom>
        Chat History ({chatHistory?.length || 0} messages):
      </Typography>
      
      {chatHistory && chatHistory.length > 0 ? (
        <Box component="pre" sx={{ 
          p: 1, 
          bgcolor: 'rgba(0,0,0,0.5)', 
          borderRadius: 1,
          fontSize: '0.75rem',
          overflow: 'auto',
          color: '#e0e0e0'
        }}>
          {JSON.stringify(chatHistory, null, 2)}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No chat messages
        </Typography>
      )}
    </Paper>
  );
};

export default DebugPanel;