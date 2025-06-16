// Global variables
let sessionId = localStorage.getItem('researchAssistantSessionId') || generateSessionId();
let uploadedFiles = [];
let querySource = 'both'; // 'uploaded', 'online', or 'both'
let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
let isProcessing = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Store session ID
    localStorage.setItem('researchAssistantSessionId', sessionId);
    
    // Set up file upload
    setupFileUpload();
    
    // Set up tabs
    setupTabs();
    
    // Set up chat
    setupChat();
    
    // Fetch uploaded files
    fetchUploadedFiles();
    
    // Render chat history
    renderChatHistory();
    
    // Add welcome message if chat is empty
    if (chatHistory.length === 0) {
        addWelcomeMessage();
    }
});

// Generate a random session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15);
}

// Add welcome message
function addWelcomeMessage() {
    const welcomeMessage = {
        role: 'assistant',
        content: 'Hello! I\'m your research assistant. You can upload documents and ask me questions about them, or ask about any research topic. How can I help you today?',
        timestamp: new Date().toISOString()
    };
    
    chatHistory.push(welcomeMessage);
    saveChatHistory();
    renderChatHistory();
}

// Set up file upload
function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    // Click on upload area to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            uploadFile(e.target.files[0]);
        }
    });
    
    // Handle drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            uploadFile(e.dataTransfer.files[0]);
        }
    });
}

// Upload a file
async function uploadFile(file) {
    // Check file type
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        alert(`Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`);
        return;
    }
    
    // Show progress
    const uploadProgress = document.getElementById('upload-progress');
    const progressBarFill = document.getElementById('progress-bar-fill');
    uploadProgress.style.display = 'block';
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        if (progress >= 90) {
            progress = 90;
            clearInterval(progressInterval);
        }
        progressBarFill.style.width = `${progress}%`;
    }, 300);
    
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload file
        const response = await fetch(`http://localhost:8000/upload?session_id=${sessionId}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Complete progress
        clearInterval(progressInterval);
        progressBarFill.style.width = '100%';
        
        // Hide progress after a delay
        setTimeout(() => {
            uploadProgress.style.display = 'none';
            progressBarFill.style.width = '0%';
        }, 500);
        
        // Refresh file list
        fetchUploadedFiles();
        
        // Add system message about the uploaded file
        const systemMessage = {
            role: 'system',
            content: `File "${file.name}" uploaded successfully. You can now ask questions about this document.`,
            timestamp: new Date().toISOString()
        };
        
        chatHistory.push(systemMessage);
        saveChatHistory();
        renderChatHistory();
        
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please try again.');
        
        // Hide progress
        clearInterval(progressInterval);
        uploadProgress.style.display = 'none';
        progressBarFill.style.width = '0%';
    }
}

// Fetch uploaded files
async function fetchUploadedFiles() {
    try {
        const response = await fetch(`http://localhost:8000/files?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.files) {
            uploadedFiles = data.files;
            renderFileList();
        }
    } catch (error) {
        console.error('Error fetching files:', error);
    }
}

// Render file list
function renderFileList() {
    const fileList = document.getElementById('file-list');
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
        fileList.innerHTML = '<div class="file-item">No documents uploaded yet</div>';
        return;
    }
    
    let html = '';
    
    uploadedFiles.forEach(file => {
        html += `
            <div class="file-item">
                <div class="file-icon">📄</div>
                <div>
                    <div>${file.filename}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9em;">${file.chunk_count} chunks processed</div>
                </div>
            </div>
        `;
    });
    
    fileList.innerHTML = html;
}

// Set up tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Set query source
            querySource = tab.dataset.source;
        });
    });
}

// Set up chat
function setupChat() {
    const sendButton = document.getElementById('send-button');
    const queryInput = document.getElementById('query-input');
    
    sendButton.addEventListener('click', () => {
        sendMessage();
    });
    
    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Focus input field
    queryInput.focus();
}

// Send a message
function sendMessage() {
    if (isProcessing) return;
    
    const queryInput = document.getElementById('query-input');
    const query = queryInput.value.trim();
    
    if (query) {
        // Add user message to chat
        const userMessage = {
            role: 'user',
            content: query,
            timestamp: new Date().toISOString()
        };
        
        chatHistory.push(userMessage);
        saveChatHistory();
        renderChatHistory();
        
        // Clear input
        queryInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Submit query
        submitQuery(query);
    }
}

// Save chat history to localStorage
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Render chat history
function renderChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    chatHistory.forEach(message => {
        if (message.role === 'system') {
            // System message (file uploads, etc.)
            const systemDiv = document.createElement('div');
            systemDiv.className = 'message system';
            systemDiv.innerHTML = `
                <div>${formatMessageContent(message.content)}</div>
                <div class="message-time">${formatTimestamp(message.timestamp)}</div>
            `;
            chatMessages.appendChild(systemDiv);
        } else {
            // User or assistant message
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.role}`;
            messageDiv.innerHTML = `
                <div>${formatMessageContent(message.content)}</div>
                <div class="message-time">${formatTimestamp(message.timestamp)}</div>
            `;
            chatMessages.appendChild(messageDiv);
        }
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format message content (handle markdown-like syntax)
function formatMessageContent(content) {
    if (!content) return '';
    
    // Replace code blocks
    content = content.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    
    // Replace inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Replace line breaks
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Show typing indicator
function showTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.style.display = 'flex';
    isProcessing = true;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.style.display = 'none';
    isProcessing = false;
}

// Submit a query
async function submitQuery(query) {
    try {
        // Create form data
        const formData = new FormData();
        formData.append('query', query);
        formData.append('source', querySource);
        
        // Add previous messages for context
        if (chatHistory.length > 0) {
            formData.append('previous_messages', JSON.stringify(chatHistory));
        }
        
        // Submit query
        const response = await fetch(`http://localhost:8000/query?session_id=${sessionId}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Response data:", data);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add assistant response to chat
        const assistantMessage = {
            role: 'assistant',
            content: data.answer || "I'm sorry, I couldn't generate an answer.",
            timestamp: new Date().toISOString()
        };
        
        chatHistory.push(assistantMessage);
        saveChatHistory();
        renderChatHistory();
        
        // Update chat history if returned from server
        if (data.chat_history) {
            chatHistory = data.chat_history;
            saveChatHistory();
        }
        
        // Show sources
        renderSources(data);
        
    } catch (error) {
        console.error('Error submitting query:', error);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add error message to chat
        const errorMessage = {
            role: 'assistant',
            content: "I'm sorry, I encountered an error while processing your request. Please try again.",
            timestamp: new Date().toISOString()
        };
        
        chatHistory.push(errorMessage);
        saveChatHistory();
        renderChatHistory();
    }
}

// Render sources
function renderSources(data) {
    const sourcesContainer = document.getElementById('sources-container');
    const sourcesContent = document.getElementById('sources-content');
    
    // Check if we have sources to display
    const hasDocumentSources = data.uploaded_documents && data.uploaded_documents.length > 0;
    const hasPaperSources = data.online_papers && data.online_papers.length > 0;
    
    if (!hasDocumentSources && !hasPaperSources) {
        sourcesContainer.style.display = 'none';
        return;
    }
    
    // Show sources container
    sourcesContainer.style.display = 'block';
    
    // Clear previous content
    sourcesContent.innerHTML = '';
    
    // Add document sources
    if (hasDocumentSources) {
        data.uploaded_documents.forEach(doc => {
            const source = doc.metadata?.source || "Unknown";
            const page = doc.metadata?.page ? ` (Page ${doc.metadata.page})` : '';
            const score = Math.round((doc.score || 0) * 100);
            
            const sourceDiv = document.createElement('div');
            sourceDiv.className = 'source-item';
            sourceDiv.innerHTML = `
                <div class="source-header">
                    <div class="source-title">${source}${page}</div>
                    <div class="source-relevance">Relevance: ${score}%</div>
                </div>
                <div class="source-content">
                    ${doc.content?.length > 300 ? doc.content.substring(0, 300) + '...' : doc.content || "No content"}
                </div>
            `;
            
            sourcesContent.appendChild(sourceDiv);
        });
    }
    
    // Add paper sources
    if (hasPaperSources) {
        data.online_papers.forEach(paper => {
            const authors = paper.authors?.join(', ') || "Unknown authors";
            
            const sourceDiv = document.createElement('div');
            sourceDiv.className = 'source-item';
            sourceDiv.innerHTML = `
                <div class="source-header">
                    <div class="source-title">
                        <a href="${paper.url || '#'}" target="_blank" class="paper-link">${paper.title || "Untitled"}</a>
                    </div>
                    <div class="source-relevance">${paper.source || "Unknown source"}</div>
                </div>
                <div class="source-content">
                    <div style="margin-bottom: 5px;">${authors} • ${paper.published || "Unknown date"}</div>
                    ${paper.summary?.length > 200 ? paper.summary.substring(0, 200) + '...' : paper.summary || "No summary available"}
                </div>
            `;
            
            sourcesContent.appendChild(sourceDiv);
        });
    }
}