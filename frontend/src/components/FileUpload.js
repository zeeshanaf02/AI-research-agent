import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Paper, 
  LinearProgress,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ onUpload, isUploading, progress }) => {
  const [error, setError] = React.useState('');
  
  const onDrop = useCallback((acceptedFiles) => {
    // Reset error
    setError('');
    
    // Check file type
    const file = acceptedFiles[0];
    if (!file) return;
    
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setError(`Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }
    
    // Upload file
    onUpload(file);
  }, [onUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper
        {...getRootProps()}
        elevation={1}
        sx={{
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'rgba(123, 104, 238, 0.15)' : 'rgba(0,0,0,0.2)',
          border: isDragActive ? '2px dashed #7b68ee' : '2px dashed #3d3d3d',
          borderRadius: 3,
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: 'rgba(123, 104, 238, 0.1)',
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            '&::before': {
              opacity: 0.8,
            }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(123, 104, 238, 0.1) 0%, rgba(0,0,0,0) 70%)',
            opacity: isDragActive ? 0.8 : 0.3,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box 
            sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(123, 104, 238, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 12px',
              transition: 'all 0.3s',
              transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isDragActive ? '0 0 20px rgba(123, 104, 238, 0.5)' : 'none',
            }}
          >
            <CloudUploadIcon 
              sx={{ 
                fontSize: 30, 
                color: 'primary.main',
                animation: isDragActive ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                  }
                }
              }} 
            />
          </Box>
          <Typography 
            variant="body1" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: isDragActive ? 'primary.main' : 'text.primary'
            }}
          >
            {isDragActive ? 'Drop the file here' : 'Upload Document'}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              display: 'block',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 10,
              px: 1.5,
              py: 0.5,
              width: 'fit-content',
              margin: '0 auto',
              border: '1px solid #3d3d3d'
            }}
          >
            PDF • DOCX • TXT
          </Typography>
        </Box>
      </Paper>
      
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="body2" 
              color="primary.main" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main',
                  display: 'inline-block',
                  mr: 1,
                  animation: 'pulse 1s infinite ease-in-out',
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
              Uploading and processing file...
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {progress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.2)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #7b68ee, #9370db)',
                boxShadow: '0 0 10px rgba(123, 104, 238, 0.5)'
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;