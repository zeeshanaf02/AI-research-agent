import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  CircularProgress,
  Button,
  useMediaQuery
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import components
import FileUpload from './components/FileUpload';
import QueryInput from './components/QueryInput';
import ResultDisplay from './components/ResultDisplay';
import FileList from './components/FileList';
import DebugPanel from './components/DebugPanel';
import SimpleChatDisplay from './components/SimpleChatDisplay';
import Logo from './components/Logo';

// Create professional research theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7b68ee',
      light: '#9c8df1',
      dark: '#5a48c0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#9370db',
      light: '#b08fe3',
      dark: '#7550c0',
      contrastText: '#ffffff'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
    error: {
      main: '#f44336',
      light: '#f88078',
      dark: '#d32f2f'
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#0d47a1'
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
          borderRadius: 10,
          border: '1px solid #3d3d3d',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #7b68ee 30%, #9370db 90%)',
          boxShadow: '0 3px 5px 2px rgba(123, 104, 238, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #6a5acd 30%, #8a2be2 90%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#3d3d3d',
              transition: 'all 0.3s',
            },
            '&:hover fieldset': {
              borderColor: '#7b68ee',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7b68ee',
              borderWidth: 2,
            },
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01562em',
      color: '#9370db',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0em',
      color: '#9370db',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontWeight: 400,
      letterSpacing: '0.00938em',
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      letterSpacing: '0.01071em',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
});

function App() {
  // Responsive design
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  
  // State
  const [sessionId, setSessionId] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [queryResult, setQueryResult] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [querySource, setQuerySource] = useState('both'); // 'uploaded', 'online', or 'both'

  // State for chat history - don't persist between sessions
  const [chatHistory, setChatHistory] = useState([]);

  // Initialize session
  useEffect(() => {
    // Generate a random session ID if not already set
    if (!sessionId) {
      const newSessionId = Math.random().toString(36).substring(2, 15);
      setSessionId(newSessionId);
      
      // Store in localStorage to persist across page refreshes
      localStorage.setItem('researchAssistantSessionId', newSessionId);
    }
    
    // Clean up on unmount
    return () => {
      // Optional: clear session on unmount
      // clearSession();
    };
  }, [sessionId]);

  // Load session from localStorage
  useEffect(() => {
    const storedSessionId = localStorage.getItem('researchAssistantSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      
      // Fetch uploaded files for this session
      fetchUploadedFiles(storedSessionId);
    }
  }, []);

  // Add welcome message if chat is empty
  useEffect(() => {
    if (chatHistory.length === 0) {
      // Add welcome message directly
      const welcomeMessage = {
        role: 'assistant',
        content: "Hello! I'm NexusScholar, your AI research companion. You can ask me questions about any research topic or academic paper. I provide structured answers with proper citations to help with your research. How can I assist you today?",
        timestamp: new Date().toISOString()
      };
      
      setChatHistory([welcomeMessage]);
    }
  }, []);
  
  // Create a ref for the chat container
  const chatContainerRef = React.useRef(null);
  
  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isQuerying]);

  // Fetch uploaded files
  const fetchUploadedFiles = async (sid) => {
    try {
      const response = await fetch(`http://localhost:8000/files?session_id=${sid}`);
      const data = await response.json();
      
      console.log("Fetched files:", data);
      
      if (data.files) {
        setUploadedFiles(data.files);
        console.log("Updated uploadedFiles state:", data.files);
      } else {
        console.log("No files property in response:", data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      const response = await fetch(`http://localhost:8000/upload?session_id=${sessionId}`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const data = await response.json();
      console.log("File upload response:", data);
      
      // Add the uploaded file to the state directly
      if (data.file_id && data.filename && data.chunk_count) {
        const newFile = {
          file_id: data.file_id,
          filename: data.filename,
          chunk_count: data.chunk_count
        };
        
        setUploadedFiles(prev => [...(prev || []), newFile]);
        console.log("Added new file to state:", newFile);
      }
      
      // Also refresh the file list from the server
      fetchUploadedFiles(sessionId);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Add message to chat
  const addMessageToChat = (role, content) => {
    console.log(`Adding message - Role: ${role}, Content: ${content}`);
    
    const newMessage = {
      role,
      content,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prevHistory => {
      const updatedHistory = [...prevHistory, newMessage];
      console.log("Updated chat history:", updatedHistory);
      return updatedHistory;
    });
  };

  // Handle query submission with chat history
  const handleChatQuerySubmit = async (query) => {
    // Check if we're in "Documents Only" mode and have no documents
    if (activeTab === 1 && (!uploadedFiles || uploadedFiles.length === 0)) {
      addMessageToChat('system', "Please upload a document first to use 'Documents Only' mode.");
      return;
    }
    
    // Create a direct user message object
    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    
    // Update chat history directly
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    console.log("Added user message directly:", userMessage);
    console.log("Updated chat history:", updatedHistory);
    
    setIsQuerying(true);
    
    const formData = new FormData();
    formData.append('query', query);
    formData.append('source', querySource);
    
    // Add previous messages for context
    if (updatedHistory.length > 0) {
      formData.append('previous_messages', JSON.stringify(updatedHistory));
    }
    
    try {
      const response = await fetch(`http://localhost:8000/query?session_id=${sessionId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setQueryResult(data);
      
      // Create assistant message directly
      const assistantMessage = {
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't generate an answer.",
        timestamp: new Date().toISOString()
      };
      
      // Update chat history directly
      setChatHistory(prevHistory => [...prevHistory, assistantMessage]);
      console.log("Added assistant response directly:", assistantMessage);
      
    } catch (error) {
      console.error('Error submitting query:', error);
      
      // Create error message directly
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      
      // Update chat history directly
      setChatHistory(prevHistory => [...prevHistory, errorMessage]);
    } finally {
      setIsQuerying(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Set query source based on tab
    if (newValue === 0) {
      setQuerySource('both');
    } else if (newValue === 1) {
      setQuerySource('uploaded');
    } else if (newValue === 2) {
      setQuerySource('online');
    }
  };

  // Add system message when file is uploaded
  const handleFileUploadWithMessage = async (file) => {
    await handleFileUpload(file);
    
    // Create system message directly
    const systemMessage = {
      role: 'system',
      content: `File "${file.name}" uploaded successfully. You can now ask questions about this document.`,
      timestamp: new Date().toISOString()
    };
    
    // Update chat history directly
    setChatHistory(prevHistory => [...prevHistory, systemMessage]);
  };
  
  // Handle file deletion
  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:8000/file/${fileId}?session_id=${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove file from state
        setUploadedFiles(prev => prev.filter(file => file.file_id !== fileId));
        
        // Create system message directly
        const systemMessage = {
          role: 'system',
          content: "File deleted successfully.",
          timestamp: new Date().toISOString()
        };
        
        // Update chat history directly
        setChatHistory(prevHistory => [...prevHistory, systemMessage]);
      } else {
        console.error('Error deleting file:', await response.text());
        
        // Create error message directly
        const errorMessage = {
          role: 'system',
          content: "Error deleting file. Please try again.",
          timestamp: new Date().toISOString()
        };
        
        // Update chat history directly
        setChatHistory(prevHistory => [...prevHistory, errorMessage]);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      addMessageToChat('system', "Error deleting file. Please try again.");
    }
  };

  // Clear session and start a new chat
  const clearSession = async () => {
    try {
      await fetch(`http://localhost:8000/session?session_id=${sessionId}`, {
        method: 'DELETE',
      });
      
      setUploadedFiles([]);
      setQueryResult(null);
      
      // Generate a new session ID
      const newSessionId = Math.random().toString(36).substring(2, 15);
      setSessionId(newSessionId);
      localStorage.setItem('researchAssistantSessionId', newSessionId);
      
      // Create welcome message directly
      const welcomeMessage = {
        role: 'assistant',
        content: "Hello! I'm NexusScholar, your AI research companion. You can ask me questions about any research topic or academic paper. I provide structured answers with proper citations to help with your research. How can I assist you today?",
        timestamp: new Date().toISOString()
      };
      
      // Reset chat history with welcome message
      setChatHistory([welcomeMessage]);
      
      console.log("Started new chat session:", newSessionId);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)',
        overflow: 'auto' // Changed from 'hidden' to 'auto' to allow scrolling
      }}>
        {/* Header with gradient */}
        <Box sx={{ 
          py: 2, 
          borderBottom: '1px solid #3d3d3d',
          background: 'linear-gradient(90deg, rgba(123,104,238,0.15) 0%, rgba(147,112,219,0.15) 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
        }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ width: '150px' }}>
                <Button
                  variant="contained"
                  onClick={clearSession}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #7b68ee 30%, #9370db 90%)',
                    boxShadow: '0 3px 5px 2px rgba(123, 104, 238, .3)',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #6a5acd 30%, #8a2be2 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px 2px rgba(123, 104, 238, .3)',
                    }
                  }}
                >
                  New Chat
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Logo size={isMobile ? "small" : "large"} />
              </Box>
              
              <Box sx={{ width: '150px' }} /> {/* Empty box for balance */}
            </Box>
          </Container>
        </Box>
        
        {/* Main content */}
        <Container maxWidth="xl" sx={{ flex: 1, py: 3, overflow: 'auto' }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, 
            gap: 3, 
            minHeight: 'calc(100vh - 150px)', // Set minimum height
            overflow: 'auto'
          }}>
            {/* Sidebar */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                overflow: 'auto',
                borderRadius: 3,
                border: '1px solid #3d3d3d',
                background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
              }}
            >
              <Typography 
                variant="h6" 
                component="h2" 
                gutterBottom
                sx={{ 
                  color: 'primary.main',
                  borderBottom: '1px solid #3d3d3d',
                  pb: 1,
                  fontWeight: 600
                }}
              >
                Documents
              </Typography>
              
              <FileUpload 
                onUpload={handleFileUploadWithMessage} 
                isUploading={isUploading} 
                progress={uploadProgress} 
              />
              
              <Box sx={{ mt: 2, flex: 1, overflow: 'auto' }}>
                {uploadedFiles && uploadedFiles.length > 0 ? (
                  <FileList 
                    files={uploadedFiles} 
                    onDeleteFile={handleDeleteFile}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    No documents uploaded yet
                  </Typography>
                )}
              </Box>
            </Paper>
            
            {/* Main Content */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflow: 'auto',
              gap: 2
            }}>
              {/* Chat Container */}
              <Paper 
                elevation={3} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  flex: 1,
                  overflow: 'auto',
                  borderRadius: 3,
                  border: '1px solid #3d3d3d',
                  background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* Tabs */}
                <Box sx={{ 
                  px: 2, 
                  pt: 2, 
                  borderBottom: '1px solid #3d3d3d',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    sx={{ 
                      '& .MuiTabs-indicator': {
                        backgroundColor: 'primary.main',
                        height: 3,
                      },
                      '& .MuiTab-root': {
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        minHeight: 48,
                        transition: 'all 0.2s',
                        '&.Mui-selected': {
                          color: 'primary.main',
                        },
                      }
                    }}
                  >
                    <Tab label="All Sources" />
                    <Tab label="Documents Only" />
                    <Tab label="Online Literature" />
                  </Tabs>
                </Box>
                
                {/* Chat Messages */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  overflow: 'auto'
                }}>
                  <Box 
                    sx={{ 
                      flex: 1, 
                      overflow: 'auto', 
                      mb: 2, 
                      bgcolor: 'rgba(0,0,0,0.2)', 
                      borderRadius: 2,
                      border: '1px solid #3d3d3d',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                    <SimpleChatDisplay 
                      messages={chatHistory} 
                      isLoading={isQuerying} 
                    />
                  </Box>
                  
                  {/* Query Input */}
                  <Box sx={{ 
                    display: 'flex', 
                    bgcolor: 'rgba(0,0,0,0.2)', 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid #3d3d3d'
                  }}>
                    <QueryInput 
                      onSubmit={handleChatQuerySubmit} 
                      disabled={isQuerying}
                      placeholder="Ask a question about your documents or any research topic..."
                      fullWidth
                    />
                  </Box>
                </Box>
              </Paper>
              
              {/* Sources Panel */}
              {queryResult && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    maxHeight: '350px', 
                    overflow: 'auto',
                    borderRadius: 3,
                    border: '1px solid #3d3d3d',
                    background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                    mb: 3 // Add bottom margin
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      color: 'primary.main',
                      borderBottom: '1px solid #3d3d3d',
                      pb: 1,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.main',
                        display: 'inline-block',
                        mr: 1
                      }} 
                    />
                    Sources
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {queryResult.uploaded_documents && queryResult.uploaded_documents.length > 0 && (
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          color="primary.main" 
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          From Your Documents
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {queryResult.uploaded_documents.map((doc, index) => {
                            const source = doc.metadata?.source || "Unknown";
                            const page = doc.metadata?.page ? ` (Page ${doc.metadata.page})` : '';
                            const score = Math.round((doc.score || 0) * 100);
                            
                            return (
                              <Paper 
                                key={index} 
                                sx={{ 
                                  p: 3, 
                                  bgcolor: 'rgba(0,0,0,0.2)',
                                  borderRadius: 2,
                                  border: '1px solid #3d3d3d',
                                  mb: 2
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  mb: 1, 
                                  pb: 1, 
                                  borderBottom: '1px solid #3d3d3d' 
                                }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {source}{page}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: score > 80 ? '#4caf50' : score > 50 ? '#ff9800' : 'text.secondary',
                                      fontWeight: 600
                                    }}
                                  >
                                    Relevance: {score}%
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {doc.content?.length > 200 ? doc.content.substring(0, 200) + '...' : doc.content || "No content"}
                                </Typography>
                              </Paper>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                    
                    {queryResult.online_papers && queryResult.online_papers.length > 0 && (
                      <Box sx={{ mt: queryResult.uploaded_documents?.length > 0 ? 2 : 0 }}>
                        <Typography 
                          variant="subtitle2" 
                          color="primary.main" 
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          From Online Literature
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {queryResult.online_papers.map((paper, index) => {
                            const authors = paper.authors?.join(', ') || "Unknown authors";
                            
                            return (
                              <Paper 
                                key={index} 
                                sx={{ 
                                  p: 3, 
                                  bgcolor: 'rgba(0,0,0,0.2)',
                                  borderRadius: 2,
                                  border: '1px solid #3d3d3d',
                                  mb: 2
                                }}
                              >
                                <Box sx={{ mb: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    component="a" 
                                    href={paper.url || '#'} 
                                    target="_blank"
                                    sx={{ 
                                      color: 'secondary.main', 
                                      textDecoration: 'none',
                                      fontWeight: 'bold',
                                      '&:hover': {
                                        textDecoration: 'underline'
                                      }
                                    }}
                                  >
                                    {paper.title || "Untitled"}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {authors} • {paper.published || "Unknown date"} • {paper.source || "Unknown source"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {paper.summary?.length > 150 ? paper.summary.substring(0, 150) + '...' : paper.summary || "No summary available"}
                                </Typography>
                              </Paper>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
            
            {/* Debug panel removed */}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;