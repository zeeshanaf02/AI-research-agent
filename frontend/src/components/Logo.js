import React from 'react';
import { Box, Typography } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';

const Logo = ({ size = 'medium', showText = true, textColor = 'gradient' }) => {
  // Size configurations
  const sizeConfig = {
    small: {
      iconSize: 24,
      fontSize: '1.2rem',
      spacing: 1,
    },
    medium: {
      iconSize: 36,
      fontSize: '1.8rem',
      spacing: 1.5,
    },
    large: {
      iconSize: 48,
      fontSize: '2.5rem',
      spacing: 2,
    },
  };
  
  const config = sizeConfig[size] || sizeConfig.medium;
  
  // Text color styles
  const textColorStyles = {
    gradient: {
      background: 'linear-gradient(45deg, #7b68ee 30%, #9370db 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    white: {
      color: 'white',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    primary: {
      color: '#7b68ee',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }
  };
  
  const selectedTextStyle = textColorStyles[textColor] || textColorStyles.gradient;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: config.spacing }}>
      {/* Logo Icon */}
      <Box 
        sx={{ 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: config.iconSize * 1.5,
          height: config.iconSize * 1.5,
        }}
      >
        {/* Background glow effect */}
        <Box 
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(123,104,238,0.4) 0%, rgba(123,104,238,0) 70%)',
            filter: 'blur(8px)',
            animation: 'pulse 3s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.6 }
            }
          }}
        />
        
        {/* Brain icon */}
        <PsychologyIcon 
          sx={{ 
            position: 'absolute',
            fontSize: config.iconSize * 1.2,
            color: '#9370db',
            filter: 'drop-shadow(0 0 8px rgba(147,112,219,0.8))',
          }} 
        />
        
        {/* Book icon */}
        <AutoStoriesIcon 
          sx={{ 
            position: 'absolute',
            fontSize: config.iconSize * 0.9,
            color: '#7b68ee',
            transform: 'translateX(8px) translateY(8px) rotate(15deg)',
            filter: 'drop-shadow(0 0 5px rgba(123,104,238,0.8))',
          }} 
        />
      </Box>
      
      {/* Logo Text */}
      {showText && (
        <Typography 
          variant="h4" 
          component="span"
          sx={{ 
            fontWeight: 700,
            fontSize: config.fontSize,
            letterSpacing: '0.5px',
            ...selectedTextStyle
          }}
        >
          NexusScholar
        </Typography>
      )}
    </Box>
  );
};

export default Logo;