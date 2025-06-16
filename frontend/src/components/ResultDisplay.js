import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';

const ResultDisplay = ({ result }) => {
  if (!result) return null;
  
  if (result.error) {
    return (
      <Paper elevation={1} sx={{ p: 3, backgroundColor: '#ffebee' }}>
        <Typography color="error">{result.error}</Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      {/* Answer */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Answer
        </Typography>
        <Box sx={{ mt: 2 }}>
          <ReactMarkdown>{result.answer}</ReactMarkdown>
        </Box>
      </Paper>
      
      {/* Uploaded Document Results */}
      {result.uploaded_documents && result.uploaded_documents.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Relevant Content from Uploaded Documents
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {result.uploaded_documents.map((doc, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Source: {doc.metadata.source}
                      {doc.metadata.page && ` (Page ${doc.metadata.page})`}
                    </Typography>
                    <Chip 
                      label={`Relevance: ${Math.round(doc.score * 100)}%`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    {doc.content.length > 500 
                      ? `${doc.content.substring(0, 500)}...` 
                      : doc.content}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* Online Papers Results */}
      {result.online_papers && result.online_papers.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Relevant Papers from Online Sources
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {result.online_papers.map((paper, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <Link href={paper.url} target="_blank" rel="noopener noreferrer">
                      {paper.title}
                    </Link>
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    {paper.authors.join(', ')} • {paper.published} • {paper.source}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    {paper.summary.length > 300 
                      ? `${paper.summary.substring(0, 300)}...` 
                      : paper.summary}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default ResultDisplay;