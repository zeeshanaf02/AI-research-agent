import os
import tempfile
import shutil
from typing import List, Dict, Any, Optional, BinaryIO
import uuid
from .parser import DocumentParser
from .vectordb import VectorDatabase

class DocumentProcessor:
    """
    Process uploaded documents and store them in the vector database
    """
    
    def __init__(self, vector_db: Optional[VectorDatabase] = None):
        """
        Initialize the document processor
        
        Args:
            vector_db: Vector database to use (creates a new one if None)
        """
        self.vector_db = vector_db or VectorDatabase()
        self.temp_dir = tempfile.mkdtemp()
        self.uploaded_files = {}  # session_id -> {file_id -> file_info}
    
    def __del__(self):
        """Clean up temporary files"""
        try:
            shutil.rmtree(self.temp_dir)
        except:
            pass
    
    def process_file(self, file: BinaryIO, filename: str, session_id: str) -> Dict[str, Any]:
        """
        Process an uploaded file
        
        Args:
            file: File-like object
            filename: Original filename
            session_id: Session ID for tracking uploads
            
        Returns:
            Information about the processed file
        """
        # Create a unique ID for this file
        file_id = str(uuid.uuid4())
        
        # Save the file to a temporary location
        file_extension = os.path.splitext(filename)[1].lower()
        temp_path = os.path.join(self.temp_dir, f"{file_id}{file_extension}")
        
        with open(temp_path, 'wb') as f:
            f.write(file.read())
        
        # Parse the document
        chunks = DocumentParser.parse_document(temp_path, filename)
        
        # Add to vector database
        doc_ids = self.vector_db.add_documents(chunks)
        
        # Store file info
        if session_id not in self.uploaded_files:
            self.uploaded_files[session_id] = {}
        
        self.uploaded_files[session_id][file_id] = {
            "filename": filename,
            "path": temp_path,
            "chunk_count": len(chunks),
            "doc_ids": doc_ids
        }
        
        return {
            "file_id": file_id,
            "filename": filename,
            "chunk_count": len(chunks)
        }
    
    def get_file_info(self, session_id: str, file_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get information about uploaded files
        
        Args:
            session_id: Session ID
            file_id: File ID (if None, returns info for all files)
            
        Returns:
            File information
        """
        if session_id not in self.uploaded_files:
            return {}
        
        if file_id:
            return self.uploaded_files[session_id].get(file_id, {})
        else:
            return {
                "files": [
                    {
                        "file_id": fid,
                        "filename": info["filename"],
                        "chunk_count": info["chunk_count"]
                    }
                    for fid, info in self.uploaded_files[session_id].items()
                ]
            }
    
    def search_documents(self, query: str, session_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Search for documents similar to the query
        
        Args:
            query: Query text
            session_id: Session ID
            top_k: Number of results to return
            
        Returns:
            List of document chunks with similarity scores
        """
        return self.vector_db.search(query, top_k)
    
    def delete_file(self, session_id: str, file_id: str):
        """
        Delete a specific file
        
        Args:
            session_id: Session ID
            file_id: File ID to delete
        """
        if session_id in self.uploaded_files and file_id in self.uploaded_files[session_id]:
            # Delete temporary file
            try:
                file_info = self.uploaded_files[session_id][file_id]
                os.remove(file_info["path"])
                
                # Remove document IDs from vector database
                if "doc_ids" in file_info:
                    # Note: In a real implementation, you would remove these from the vector DB
                    pass
                
                # Remove from uploaded_files
                del self.uploaded_files[session_id][file_id]
            except Exception as e:
                print(f"Error deleting file: {e}")
    
    def clear_session(self, session_id: str):
        """
        Clear all files for a session
        
        Args:
            session_id: Session ID
        """
        if session_id in self.uploaded_files:
            # Delete temporary files
            for file_info in self.uploaded_files[session_id].values():
                try:
                    os.remove(file_info["path"])
                except:
                    pass
            
            # Remove from uploaded_files
            del self.uploaded_files[session_id]