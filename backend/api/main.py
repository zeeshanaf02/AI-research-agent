from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import uuid
import os
import json
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Import modules
import sys
import os

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from document_processing.processor import DocumentProcessor
from document_processing.vectordb import VectorDatabase
from search.academic import AcademicSearch
from search.llm import LLMService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Research Assistant API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vector_db = VectorDatabase()
document_processor = DocumentProcessor(vector_db)
academic_search = AcademicSearch()
llm_service = LLMService()

# Session management
sessions = {}  # session_id -> creation_time

def get_session_id(session_id: Optional[str] = Header(None)) -> str:
    """Get or create a session ID"""
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Store session
    sessions[session_id] = sessions.get(session_id, {})
    
    return session_id

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Research Assistant API"}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    session_id: str = Depends(get_session_id)
):
    """Upload a document"""
    # Check file extension
    allowed_extensions = [".pdf", ".docx", ".txt"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Process the file
        result = document_processor.process_file(file.file, file.filename, session_id)
        
        return {
            "session_id": session_id,
            "file_id": result["file_id"],
            "filename": result["filename"],
            "chunk_count": result["chunk_count"],
            "message": "File uploaded and processed successfully"
        }
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )

@app.get("/files")
def get_files(session_id: str = Depends(get_session_id)):
    """Get information about uploaded files"""
    return document_processor.get_file_info(session_id)

@app.post("/query")
async def query(
    query: str = Form(...),
    source: str = Form("both"),  # "uploaded", "online", or "both"
    session_id: str = Depends(get_session_id),
    previous_messages: Optional[str] = Form(None)  # JSON string of previous messages
):
    """Query the research assistant with chat history support"""
    try:
        # Initialize session chat history if it doesn't exist
        if session_id not in sessions:
            sessions[session_id] = {}
        
        if "chat_history" not in sessions[session_id]:
            sessions[session_id]["chat_history"] = []
        
        # Parse previous messages if provided
        chat_history = sessions[session_id]["chat_history"]
        if previous_messages:
            try:
                chat_history = json.loads(previous_messages)
                sessions[session_id]["chat_history"] = chat_history
            except:
                logger.warning("Failed to parse previous messages")
        
        results = {}
        
        # Search uploaded documents
        if source in ["uploaded", "both"]:
            doc_results = document_processor.search_documents(query, session_id, top_k=5)
            if doc_results:
                results["uploaded_documents"] = doc_results
        
        # Search online sources
        if source in ["online", "both"]:
            paper_results = academic_search.search_all(query, max_results=3)
            if paper_results:
                results["online_papers"] = paper_results
        
        # Generate answer using LLM
        context = ""
        if "uploaded_documents" in results:
            doc_context = llm_service.format_context_from_documents(results["uploaded_documents"])
            context += doc_context
        
        if "online_papers" in results:
            paper_context = llm_service.format_context_from_papers(results["online_papers"])
            if context:
                context += "\n\n" + paper_context
            else:
                context = paper_context
        
        # Include chat history in the context for better continuity
        chat_context = "\n\nPrevious conversation:\n"
        for msg in chat_history[-5:]:  # Include last 5 messages for context
            role = msg.get("role", "user")
            content = msg.get("content", "")
            chat_context += f"{role.capitalize()}: {content}\n"
        
        # Check if it's a simple greeting
        simple_greetings = ["hi", "hello", "hey", "greetings", "howdy", "hola", "what's up", "how are you"]
        is_simple_greeting = query.lower().strip() in simple_greetings or query.lower().strip().startswith("hi ") or query.lower().strip().startswith("hello ")
        
        # Add source information for citation
        source_info = ""
        if "online_papers" in results and results["online_papers"]:
            source_info = "\n\nSource Information for Citation:\n"
            for i, paper in enumerate(results["online_papers"]):
                title = paper.get("title", "Unknown Title")
                url = paper.get("url", "")
                source_info += f"{i+1}. [{title}]({url})\n"
        
        if context:
            # Add chat history to context if there's any history
            if len(chat_history) > 0:
                context += chat_context
            
            # Add source information to context
            context += source_info
            
            answer = llm_service.answer_question(query, context)
            results["answer"] = answer
        elif is_simple_greeting:
            # Handle simple greetings even without context
            answer = llm_service.answer_question(query, "The user is greeting you. Respond in a friendly manner.")
            results["answer"] = answer
        else:
            # For other questions without context, use general knowledge
            context_with_sources = (chat_context if len(chat_history) > 0 else "") + source_info
            answer = llm_service.answer_question(query, context_with_sources)
            results["answer"] = answer
        
        # Add the current Q&A to chat history
        chat_history.append({"role": "user", "content": query})
        chat_history.append({"role": "assistant", "content": results["answer"]})
        sessions[session_id]["chat_history"] = chat_history
        
        # Include chat history in response
        results["chat_history"] = chat_history
        
        return results
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@app.delete("/file/{file_id}")
def delete_file(file_id: str, session_id: str = Depends(get_session_id)):
    """Delete a specific file"""
    document_processor.delete_file(session_id, file_id)
    return {"message": f"File {file_id} deleted successfully"}

@app.delete("/session")
def clear_session(session_id: str = Depends(get_session_id)):
    """Clear a session"""
    document_processor.clear_session(session_id)
    if session_id in sessions:
        del sessions[session_id]
    
    return {"message": "Session cleared successfully"}

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)