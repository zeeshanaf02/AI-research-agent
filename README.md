# NexusScholar AI Research Assistant

NexusScholar is a sophisticated AI-powered research companion that bridges the gap between academic knowledge and user inquiries. It leverages advanced language models and retrieval-augmented generation (RAG) to provide structured, well-cited answers to complex research questions.

## Features

- **Document Upload**: Upload and process PDF, DOCX, and TXT files
- **Academic Search**: Search arXiv and PubMed for academic papers
- **Question Answering**: Ask questions about uploaded documents or academic literature
- **Dual Mode**: Search both uploaded documents and online sources simultaneously
- **Structured Responses**: Get well-formatted answers with proper citations
- **Conversation History**: Maintain context throughout your research session
- **New Chat**: Start fresh research sessions with a single click
- **Modern UI**: Clean, responsive interface with dark mode

## Project Structure

```
research-agent/
├── backend/
│   ├── api/                  # FastAPI endpoints
│   ├── document_processing/  # Document parsing and vector storage
│   ├── search/               # Academic search and LLM integration
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Backend entry point
└── frontend/
    ├── public/               # Static files
    ├── src/                  # React source code
    │   ├── components/       # React components
    │   └── App.js            # Main application component
    └── package.json          # Node.js dependencies
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory with your API keys:
   ```
   GROQ_API_KEY=your_groq_api_key
   ```

5. Run the backend server:
   ```
   python run.py
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```
   cd frontend
   npm install
   ```

2. Run the frontend development server:
   ```
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Upload documents using the file upload component
3. Ask questions about your documents or search for academic papers
4. View the results and explore the retrieved information

## Technologies Used

- **Backend**:
  - FastAPI: Web framework
  - FAISS: Vector database for document retrieval
  - Sentence Transformers: Document embedding
  - PyMuPDF/pdfplumber: PDF parsing
  - python-docx: DOCX parsing
  - Groq API: LLM integration with Llama 3 70B model

- **Frontend**:
  - React: UI framework
  - Material-UI: Component library
  - react-dropzone: File upload
  - axios: HTTP client

## Privacy

- Uploaded documents are processed in-session and stored temporarily
- Documents are not stored long-term unless explicitly requested
- All processing happens on your local machine