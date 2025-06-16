import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const QueryInput = ({ onSubmit, disabled, placeholder, fullWidth }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  
  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
      setQuery(''); // Clear input after sending
    }
  };
  
  // Handle key press events
  const handleKeyPress = (e) => {
    // Submit on Enter key (without Shift key for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !disabled) {
        onSubmit(query.trim());
        setQuery(''); // Clear input after sending
      }
    }
  };
  
  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        display: 'flex', 
        width: '100%',
        alignItems: 'center'
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder || "Ask a question about your documents or any research topic..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        size="medium"
        inputRef={inputRef}
        multiline
        maxRows={4}
        sx={{ 
          mr: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            backgroundColor: 'rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(0,0,0,0.3)',
              '& fieldset': {
                borderColor: 'primary.main',
                borderWidth: '2px',
              },
            },
          },
          '& .MuiInputBase-input': {
            padding: '12px 14px',
          }
        }}
        // No input adornments
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!query.trim() || disabled}
        sx={{ 
          borderRadius: 3,
          minWidth: 'auto',
          px: 2,
          py: 1.5,
          background: 'linear-gradient(45deg, #7b68ee 30%, #9370db 90%)',
          boxShadow: '0 3px 5px 2px rgba(123, 104, 238, .3)',
          transition: 'all 0.3s',
          '&:hover': {
            background: 'linear-gradient(45deg, #6a5acd 30%, #8a2be2 90%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 10px 2px rgba(123, 104, 238, .3)',
          }
        }}
      >
        <SendIcon />
      </Button>
    </Box>
  );
};

export default QueryInput;