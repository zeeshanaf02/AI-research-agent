import arxiv
import requests
from Bio import Entrez
import time
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AcademicSearch:
    """
    Search for academic papers from online sources (arXiv, PubMed)
    """
    
    def __init__(self, email: str = "user@example.com"):
        """
        Initialize the academic search
        
        Args:
            email: Email for PubMed API (required by NCBI)
        """
        self.email = email
        Entrez.email = email
    
    def search_arxiv(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search arXiv for papers
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            List of paper information
        """
        try:
            search = arxiv.Search(
                query=query,
                max_results=max_results,
                sort_by=arxiv.SortCriterion.Relevance
            )
            
            results = []
            for paper in search.results():
                results.append({
                    "title": paper.title,
                    "authors": [author.name for author in paper.authors],
                    "summary": paper.summary,
                    "published": paper.published.strftime("%Y-%m-%d"),
                    "url": paper.pdf_url,
                    "source": "arXiv",
                    "id": paper.get_short_id()
                })
            
            return results
        except Exception as e:
            logger.error(f"Error searching arXiv: {e}")
            return []
    
    def search_pubmed(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search PubMed for papers
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            List of paper information
        """
        try:
            # Search for IDs
            handle = Entrez.esearch(db="pubmed", term=query, retmax=max_results)
            record = Entrez.read(handle)
            handle.close()
            
            id_list = record["IdList"]
            
            if not id_list:
                return []
            
            # Fetch details
            handle = Entrez.efetch(db="pubmed", id=id_list, retmode="xml")
            records = Entrez.read(handle)
            handle.close()
            
            results = []
            for i, record in enumerate(records["PubmedArticle"]):
                article = record["MedlineCitation"]["Article"]
                
                # Extract authors
                authors = []
                if "AuthorList" in article:
                    for author in article["AuthorList"]:
                        if "LastName" in author and "ForeName" in author:
                            authors.append(f"{author['LastName']} {author['ForeName']}")
                
                # Extract abstract
                abstract = ""
                if "Abstract" in article and "AbstractText" in article["Abstract"]:
                    abstract_parts = article["Abstract"]["AbstractText"]
                    if isinstance(abstract_parts, list):
                        abstract = " ".join([str(part) for part in abstract_parts])
                    else:
                        abstract = str(abstract_parts)
                
                # Extract publication date
                pub_date = ""
                if "PubDate" in article["Journal"]["JournalIssue"]["PubDate"]:
                    date_parts = []
                    for key in ["Year", "Month", "Day"]:
                        if key in article["Journal"]["JournalIssue"]["PubDate"]:
                            date_parts.append(article["Journal"]["JournalIssue"]["PubDate"][key])
                    pub_date = "-".join(date_parts)
                
                results.append({
                    "title": article["ArticleTitle"],
                    "authors": authors,
                    "summary": abstract,
                    "published": pub_date,
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{id_list[i]}/",
                    "source": "PubMed",
                    "id": id_list[i]
                })
            
            return results
        except Exception as e:
            logger.error(f"Error searching PubMed: {e}")
            return []
    
    def search_all(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search all sources for papers
        
        Args:
            query: Search query
            max_results: Maximum number of results to return per source
            
        Returns:
            List of paper information
        """
        arxiv_results = self.search_arxiv(query, max_results)
        pubmed_results = self.search_pubmed(query, max_results)
        
        # Combine and sort by relevance (assuming the APIs return in relevance order)
        combined = []
        for i in range(max(len(arxiv_results), len(pubmed_results))):
            if i < len(arxiv_results):
                combined.append(arxiv_results[i])
            if i < len(pubmed_results):
                combined.append(pubmed_results[i])
        
        return combined[:max_results * 2]  # Limit total results