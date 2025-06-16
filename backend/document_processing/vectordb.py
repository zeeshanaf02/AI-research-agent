import os
import re
from typing import List, Dict, Any, Optional, Tuple
import pickle
import uuid
import tempfile
import logging
import math
from collections import Counter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleVectorDatabase:
    """
    Very simple in-memory vector database using basic keyword matching
    """
    
    def __init__(self):
        """
        Initialize the simple vector database
        """
        self.documents = {}  # id -> document mapping
        self.document_ids = []  # List of document IDs in order of addition
        self.index = {}  # word -> [doc_ids]
        self.stop_words = {
            'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
            'when', 'where', 'how', 'why', 'which', 'who', 'whom', 'this', 'that',
            'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will',
            'would', 'shall', 'should', 'may', 'might', 'must', 'to', 'of', 'in',
            'for', 'on', 'by', 'at', 'with', 'about', 'against', 'between', 'into',
            'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up',
            'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
            'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more',
            'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
            'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now'
        }
    
    def _tokenize(self, text: str) -> List[str]:
        """
        Simple tokenization: lowercase, remove punctuation, split by whitespace, remove stop words
        """
        # Lowercase and remove punctuation
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        
        # Split by whitespace and remove stop words
        tokens = [word for word in text.split() if word not in self.stop_words]
        
        return tokens
    
    def add_documents(self, documents: List[Dict[str, Any]]) -> List[str]:
        """
        Add documents to the vector database
        
        Args:
            documents: List of document chunks with content and metadata
            
        Returns:
            List of document IDs
        """
        if not documents:
            return []
        
        # Store documents and build index
        doc_ids = []
        for doc in documents:
            doc_id = doc.get("id", str(uuid.uuid4()))
            self.documents[doc_id] = doc
            self.document_ids.append(doc_id)
            doc_ids.append(doc_id)
            
            # Index the document
            tokens = self._tokenize(doc["content"])
            for token in tokens:
                if token not in self.index:
                    self.index[token] = []
                if doc_id not in self.index[token]:
                    self.index[token].append(doc_id)
        
        logger.info(f"Added {len(documents)} documents to vector database")
        return doc_ids
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Search for documents similar to the query
        
        Args:
            query: Query text
            top_k: Number of results to return
            
        Returns:
            List of document chunks with similarity scores
        """
        if not self.document_ids:
            return []
        
        # Tokenize query
        query_tokens = self._tokenize(query)
        
        # Count document matches
        doc_scores = Counter()
        
        # For each token in the query, find matching documents
        for token in query_tokens:
            if token in self.index:
                for doc_id in self.index[token]:
                    doc_scores[doc_id] += 1
        
        # Normalize scores by query length
        query_len = len(query_tokens) or 1  # Avoid division by zero
        for doc_id in doc_scores:
            doc_scores[doc_id] = doc_scores[doc_id] / query_len
        
        # Get top-k documents
        top_docs = doc_scores.most_common(top_k)
        
        # Format results
        results = []
        for doc_id, score in top_docs:
            doc = self.documents[doc_id].copy()
            doc["score"] = float(score)
            results.append(doc)
        
        return results
    
    def clear(self):
        """Clear the database"""
        self.documents = {}
        self.document_ids = []
        self.index = {}
    
    def save(self, directory: str) -> str:
        """
        Save the vector database to disk
        
        Args:
            directory: Directory to save to
            
        Returns:
            Path to the saved database
        """
        os.makedirs(directory, exist_ok=True)
        
        # Save index, documents and document_ids
        db_path = os.path.join(directory, "db.pkl")
        with open(db_path, 'wb') as f:
            pickle.dump((self.index, self.documents, self.document_ids), f)
        
        return directory
    
    @classmethod
    def load(cls, directory: str) -> 'SimpleVectorDatabase':
        """
        Load a vector database from disk
        
        Args:
            directory: Directory to load from
            
        Returns:
            Loaded SimpleVectorDatabase
        """
        db = cls()
        
        # Load index, documents and document_ids
        db_path = os.path.join(directory, "db.pkl")
        with open(db_path, 'rb') as f:
            db.index, db.documents, db.document_ids = pickle.load(f)
        
        return db

# Alias for backward compatibility
VectorDatabase = SimpleVectorDatabase