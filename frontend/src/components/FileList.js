import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const FileList = ({ files, onDeleteFile }) => {
  if (!files || files.length === 0) {
    return null;
  }
  
  // Function to get the appropriate icon based on file extension
  const getFileIcon = (filename) => {
    if (filename.toLowerCase().endsWith('.pdf')) {
      return <PictureAsPdfIcon color="error" />;
    } else if (filename.toLowerCase().endsWith('.docx')) {
      return <ArticleIcon color="primary" />;
    } else if (filename.toLowerCase().endsWith('.txt')) {
      return <TextSnippetIcon color="success" />;
    } else {
      return <DescriptionIcon color="primary" />;
    }
  };
  
  return (
    <Box>
      <List sx={{ p: 0 }}>
        {files.map((file) => (
          <Paper
            key={file.file_id}
            elevation={1}
            sx={{
              mb: 1.5,
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.3s',
              border: '1px solid #3d3d3d',
              '&:hover': {
                backgroundColor: 'rgba(123, 104, 238, 0.05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
              },
            }}
          >
            <ListItem
              secondaryAction={
                <Tooltip title="Remove file">
                  <span>
                    <IconButton 
                      edge="end" 
                      onClick={() => onDeleteFile && onDeleteFile(file.file_id)}
                      sx={{ 
                        color: 'text.secondary',
                        opacity: 0.7,
                        '&:hover': {
                          color: 'error.main',
                          opacity: 1,
                        }
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              }
            >
              <ListItemIcon>
                {getFileIcon(file.filename)}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Tooltip title={file.filename}>
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ 
                        fontWeight: 500,
                        maxWidth: '150px'
                      }}
                    >
                      {file.filename}
                    </Typography>
                  </Tooltip>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        bgcolor: 'success.main',
                        display: 'inline-block',
                        mr: 1
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {`${file.chunk_count} chunks processed`}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default FileList;