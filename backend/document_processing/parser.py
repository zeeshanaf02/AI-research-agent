import os
import pdfplumber
import docx
import fitz  # PyMuPDF
from typing import List, Dict, Any, Tuple, Optional
import uuid

class DocumentParser:
    """
    Parser for different document types (.pdf, .docx, .txt)
    """
    
    @staticmethod
    def parse_document(file_path: str, file_name: str) -> List[Dict[str, Any]]:
        """
        Parse a document and return chunks with metadata
        
        Args:
            file_path: Path to the document
            file_name: Original filename
            
        Returns:
            List of chunks with metadata
        """
        file_extension = os.path.splitext(file_name)[1].lower()
        
        if file_extension == '.pdf':
            return DocumentParser._parse_pdf(file_path, file_name)
        elif file_extension == '.docx':
            return DocumentParser._parse_docx(file_path, file_name)
        elif file_extension == '.txt':
            return DocumentParser._parse_txt(file_path, file_name)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
    
    @staticmethod
    def _parse_pdf(file_path: str, file_name: str) -> List[Dict[str, Any]]:
        """Parse PDF using pdfplumber and PyMuPDF for better text extraction"""
        chunks = []
        
        # Try PyMuPDF first for better performance
        try:
            doc = fitz.open(file_path)
            
            # First, extract document metadata if available
            metadata = doc.metadata
            if metadata:
                meta_content = "Document Metadata:\n"
                for key, value in metadata.items():
                    if value and str(value).strip():
                        meta_content += f"{key}: {value}\n"
                
                if len(meta_content) > 20:  # Only add if we have meaningful metadata
                    chunks.append({
                        "id": str(uuid.uuid4()),
                        "content": meta_content,
                        "metadata": {
                            "source": file_name,
                            "chunk_type": "metadata"
                        }
                    })
            
            # Extract table of contents if available
            toc = doc.get_toc()
            if toc:
                toc_content = "Table of Contents:\n"
                for level, title, page in toc:
                    indent = "  " * (level - 1)
                    toc_content += f"{indent}• {title} (Page {page})\n"
                
                chunks.append({
                    "id": str(uuid.uuid4()),
                    "content": toc_content,
                    "metadata": {
                        "source": file_name,
                        "chunk_type": "toc"
                    }
                })
            
            # Process each page
            for page_num, page in enumerate(doc):
                text = page.get_text()
                
                # Skip empty pages
                if not text.strip():
                    continue
                
                # Extract page text
                chunks.append({
                    "id": str(uuid.uuid4()),
                    "content": text,
                    "metadata": {
                        "source": file_name,
                        "page": page_num + 1,
                        "chunk_type": "page"
                    }
                })
                
                # Extract tables from the page if any
                tables = page.find_tables()
                if tables:
                    for i, table in enumerate(tables):
                        table_text = "Table content:\n"
                        for row in table.extract():
                            table_text += " | ".join([str(cell) for cell in row]) + "\n"
                        
                        chunks.append({
                            "id": str(uuid.uuid4()),
                            "content": table_text,
                            "metadata": {
                                "source": file_name,
                                "page": page_num + 1,
                                "chunk_type": "table",
                                "table_index": i
                            }
                        })
            
            doc.close()
        except Exception as e:
            # Fallback to pdfplumber if PyMuPDF fails
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    text = page.extract_text() or ""
                    if text.strip():  # Only add non-empty pages
                        chunks.append({
                            "id": str(uuid.uuid4()),
                            "content": text,
                            "metadata": {
                                "source": file_name,
                                "page": page_num + 1,
                                "chunk_type": "page"
                            }
                        })
                    
                    # Extract tables
                    tables = page.extract_tables()
                    if tables:
                        for i, table in enumerate(tables):
                            table_text = "Table content:\n"
                            for row in table:
                                table_text += " | ".join([str(cell or "") for cell in row]) + "\n"
                            
                            chunks.append({
                                "id": str(uuid.uuid4()),
                                "content": table_text,
                                "metadata": {
                                    "source": file_name,
                                    "page": page_num + 1,
                                    "chunk_type": "table",
                                    "table_index": i
                                }
                            })
        
        return chunks
    
    @staticmethod
    def _parse_docx(file_path: str, file_name: str) -> List[Dict[str, Any]]:
        """Parse DOCX using python-docx"""
        chunks = []
        doc = docx.Document(file_path)
        
        # Process by paragraphs
        current_chunk = ""
        current_chunk_size = 0
        max_chunk_size = 1000  # Characters
        
        for para_num, para in enumerate(doc.paragraphs):
            if para.text.strip():
                if current_chunk_size + len(para.text) > max_chunk_size and current_chunk:
                    # Save current chunk and start a new one
                    chunks.append({
                        "id": str(uuid.uuid4()),
                        "content": current_chunk,
                        "metadata": {
                            "source": file_name,
                            "chunk_type": "paragraph_group"
                        }
                    })
                    current_chunk = para.text
                    current_chunk_size = len(para.text)
                else:
                    # Add to current chunk
                    if current_chunk:
                        current_chunk += "\n\n" + para.text
                    else:
                        current_chunk = para.text
                    current_chunk_size += len(para.text)
        
        # Add the last chunk if it exists
        if current_chunk:
            chunks.append({
                "id": str(uuid.uuid4()),
                "content": current_chunk,
                "metadata": {
                    "source": file_name,
                    "chunk_type": "paragraph_group"
                }
            })
        
        return chunks
    
    @staticmethod
    def _parse_txt(file_path: str, file_name: str) -> List[Dict[str, Any]]:
        """Parse TXT files"""
        chunks = []
        
        with open(file_path, 'r', encoding='utf-8', errors='replace') as file:
            text = file.read()
            
            # Split by double newlines (paragraphs)
            paragraphs = text.split('\n\n')
            
            current_chunk = ""
            current_chunk_size = 0
            max_chunk_size = 1000  # Characters
            
            for para in paragraphs:
                if para.strip():
                    if current_chunk_size + len(para) > max_chunk_size and current_chunk:
                        # Save current chunk and start a new one
                        chunks.append({
                            "id": str(uuid.uuid4()),
                            "content": current_chunk,
                            "metadata": {
                                "source": file_name,
                                "chunk_type": "paragraph_group"
                            }
                        })
                        current_chunk = para
                        current_chunk_size = len(para)
                    else:
                        # Add to current chunk
                        if current_chunk:
                            current_chunk += "\n\n" + para
                        else:
                            current_chunk = para
                        current_chunk_size += len(para)
            
            # Add the last chunk if it exists
            if current_chunk:
                chunks.append({
                    "id": str(uuid.uuid4()),
                    "content": current_chunk,
                    "metadata": {
                        "source": file_name,
                        "chunk_type": "paragraph_group"
                    }
                })
        
        return chunks